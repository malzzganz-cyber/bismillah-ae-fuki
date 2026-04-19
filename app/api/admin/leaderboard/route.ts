import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    await adminAuth.verifyIdToken(token);

    // Top by balance
    const balSnap = await adminDb.collection('users')
      .orderBy('balance', 'desc')
      .limit(10)
      .get();

    // Top by totalTransactions
    const txSnap = await adminDb.collection('users')
      .orderBy('totalTransactions', 'desc')
      .limit(10)
      .get();

    const topBalance = balSnap.docs.map(d => ({
      email: (d.data().email as string).replace(/(.{2}).*(@.*)/, '$1***$2'),
      balance: d.data().balance ?? 0,
      uid: d.id,
    }));

    const topTransactions = txSnap.docs.map(d => ({
      email: (d.data().email as string).replace(/(.{2}).*(@.*)/, '$1***$2'),
      totalTransactions: d.data().totalTransactions ?? 0,
      uid: d.id,
    }));

    return NextResponse.json({ success: true, topBalance, topTransactions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
