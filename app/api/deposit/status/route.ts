import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getDepositStatus } from '@/lib/rumahotp';
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

    const { transactionId, depositId } = await req.json();

    // Get status from RumahOTP
    const data = await getDepositStatus(depositId);

    // Determine status
    const rawStatus = (data.status || data.payment_status || '').toLowerCase();
    let newStatus: 'pending' | 'success' | 'failed' | 'cancelled' = 'pending';
    if (rawStatus === 'success' || rawStatus === 'paid' || rawStatus === 'completed') newStatus = 'success';
    else if (rawStatus === 'failed' || rawStatus === 'expired') newStatus = 'failed';
    else if (rawStatus === 'cancelled') newStatus = 'cancelled';

    // Update Firestore transaction
    const txRef = adminDb.collection('transactions').doc(transactionId);
    const txSnap = await txRef.get();
    if (!txSnap.exists) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    const txData = txSnap.data()!;

    if (newStatus === 'success' && txData.status !== 'success') {
      // Credit user balance
      const userRef = adminDb.collection('users').doc(uid);
      await adminDb.runTransaction(async (t) => {
        const userSnap = await t.get(userRef);
        const currentBalance = userSnap.data()?.balance ?? 0;
        t.update(userRef, {
          balance: currentBalance + txData.amount,
          totalTransactions: admin.firestore.FieldValue.increment(1),
        });
        t.update(txRef, {
          status: 'success',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
    } else if (newStatus !== 'pending' && txData.status !== newStatus) {
      await txRef.update({
        status: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ success: true, status: newStatus, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
