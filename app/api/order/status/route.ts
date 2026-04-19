import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getOrderStatus } from '@/lib/rumahotp';
import admin from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    await adminAuth.verifyIdToken(token);

    const { docId, orderId } = await req.json();

    const data = await getOrderStatus(orderId);

    const rawStatus = (data.status || '').toLowerCase();
    let newStatus: string = 'pending';
    if (rawStatus === 'received' || rawStatus === 'sms') newStatus = 'received';
    else if (rawStatus === 'finished' || rawStatus === 'done') newStatus = 'finished';
    else if (rawStatus === 'cancelled' || rawStatus === 'cancel') newStatus = 'cancelled';
    else if (rawStatus === 'timeout' || rawStatus === 'expired') newStatus = 'timeout';

    const otp = data.sms || data.otp || data.code || null;
    const phoneNumber = data.phone || data.number || null;

    const updateData: any = {
      status: newStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (otp) updateData.otp = otp;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    await adminDb.collection('orders').doc(docId).update(updateData);

    return NextResponse.json({ success: true, status: newStatus, otp, phoneNumber, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
