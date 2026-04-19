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

// POST /api/admin/withdraw - create withdraw
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);

    if (decoded.uid !== process.env.ADMIN_UID) {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { amount, bankCode, accountNumber, accountName } = await req.json();

    if (!amount || !bankCode || !accountNumber || !accountName) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }
    if (amount < 10000) {
      return NextResponse.json({ error: 'Minimal withdraw Rp 10.000' }, { status: 400 });
    }

    // Call RumahOTP H2H withdraw endpoint
    const url = `/api/v1/withdraw/create?amount=${amount}&bank_code=${bankCode}&account_number=${accountNumber}&account_name=${encodeURIComponent(accountName)}`;
    const data = await rumahOTPFetch(url);

    const withdrawId = data.withdraw_id || data.id;

    // Save to Firestore
    const ref = adminDb.collection('withdraws').doc();
    await ref.set({
      id: ref.id,
      adminId: decoded.uid,
      amount,
      bankCode,
      accountNumber,
      accountName,
      status: 'pending',
      withdrawId,
      rawData: data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, withdrawId, docId: ref.id, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// GET /api/admin/withdraw - list withdraws
export async function GET(req: NextRequest) {
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

    const snap = await adminDb.collection('withdraws')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const withdraws = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, withdraws });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
