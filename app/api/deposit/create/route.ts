import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createDeposit } from '@/lib/rumahotp';
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

    const { amount } = await req.json();
    if (!amount || amount < 10000) {
      return NextResponse.json({ error: 'Minimal deposit Rp 10.000' }, { status: 400 });
    }

    const data = await createDeposit(amount);
    if (!data || data.error) {
      return NextResponse.json({ error: data?.message || 'Gagal membuat deposit' }, { status: 400 });
    }

    const depositId = data.deposit_id || data.id;
    const qrisUrl = data.qris_url || data.payment_url || data.qr_url;

    // Save transaction to Firestore
    const ref = adminDb.collection('transactions').doc();
    await ref.set({
      id: ref.id,
      userId: uid,
      type: 'deposit',
      amount,
      status: 'pending',
      depositId,
      qrisUrl,
      rawData: data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      transactionId: ref.id,
      depositId,
      qrisUrl,
      amount,
      data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
