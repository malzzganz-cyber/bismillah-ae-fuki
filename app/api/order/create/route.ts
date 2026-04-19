import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createOrder, applyMarkup } from '@/lib/rumahotp';
import admin from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const { serviceId, operatorId, serviceName, operatorName, basePrice } = await req.json();

    const markedPrice = applyMarkup(basePrice);

    // Check balance first
    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }
    const balance = userSnap.data()?.balance ?? 0;
    if (balance < markedPrice) {
      return NextResponse.json({ error: `Saldo tidak cukup. Butuh: Rp ${markedPrice.toLocaleString('id-ID')}, Saldo: Rp ${balance.toLocaleString('id-ID')}` }, { status: 400 });
    }

    // Call RumahOTP
    const data = await createOrder(serviceId, operatorId);
    if (!data || data.error) {
      return NextResponse.json({ error: data?.message || 'Gagal membuat order' }, { status: 400 });
    }

    const orderId = data.order_id || data.id;
    const phoneNumber = data.phone || data.number || data.phone_number || '';

    // Save order & deduct balance in transaction
    const orderRef = adminDb.collection('orders').doc();
    await adminDb.runTransaction(async (t) => {
      const snap = await t.get(userRef);
      const cur = snap.data()?.balance ?? 0;
      if (cur < markedPrice) throw new Error('Saldo tidak cukup');
      t.update(userRef, {
        balance: cur - markedPrice,
        totalTransactions: admin.firestore.FieldValue.increment(1),
      });
      t.set(orderRef, {
        id: orderRef.id,
        userId: uid,
        serviceId,
        serviceName: serviceName || serviceId,
        operatorId,
        operatorName: operatorName || operatorId,
        orderId,
        phoneNumber,
        otp: null,
        price: basePrice,
        markedPrice,
        status: 'pending',
        rawData: data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({
      success: true,
      orderId,
      docId: orderRef.id,
      phoneNumber,
      markedPrice,
      data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
