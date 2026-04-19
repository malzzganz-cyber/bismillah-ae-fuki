import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import admin from '@/lib/firebase-admin';

const BASE_URL = process.env.RUMAHOTP_BASE_URL || 'https://www.rumahotp.io';
const API_KEY = process.env.RUMAHOTP_API_KEY || '';

async function rumahOTPFetch(url: string) {
  const sep = url.includes('?') ? '&' : '?';
  const fullUrl = `${BASE_URL}${url}${sep}api_key=${API_KEY}`;
  const res = await fetch(fullUrl, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (!res.ok) throw new Error(`RumahOTP error: ${res.status}`);
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);

    if (decoded.uid !== process.env.ADMIN_UID) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { docId, withdrawId } = await req.json();

    const data = await rumahOTPFetch(`/api/v1/withdraw/get_status?withdraw_id=${withdrawId}`);

    const rawStatus = (data.status || '').toLowerCase();
    let newStatus = 'pending';
    if (rawStatus === 'success' || rawStatus === 'completed') newStatus = 'success';
    else if (rawStatus === 'failed' || rawStatus === 'rejected') newStatus = 'failed';

    await adminDb.collection('withdraws').doc(docId).update({
      status: newStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, status: newStatus, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
