import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { cancelOrder } from '@/lib/rumahotp';
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

    const { docId, orderId } = await req.json();

    const orderRef = adminDb.collection('orders').doc(docId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }
    const orderData = orderSnap.data()!;
    if (orderData.userId !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cancel on RumahOTP
    const data = await cancelOrder(orderId);

    // Refund balance
    const userRef = adminDb.collection('users').doc(uid);
    await adminDb.runTransaction(async (t) => {
      const userSnap = await t.get(userRef);
      const cur = userSnap.data()?.balance ?? 0;
      t.update(userRef, { balance: cur + orderData.markedPrice });
      t.update(orderRef, {
        status: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
