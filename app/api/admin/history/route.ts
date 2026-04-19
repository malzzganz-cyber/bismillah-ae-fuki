import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const [txSnap, orderSnap] = await Promise.all([
      adminDb.collection('transactions')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get(),
      adminDb.collection('orders')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get(),
    ]);

    const transactions = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const orders = orderSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ success: true, transactions, orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
