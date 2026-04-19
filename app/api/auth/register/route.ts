import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import admin from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({ email, password });
    const uid = userRecord.uid;

    // Check if admin
    const isAdmin = uid === process.env.ADMIN_UID;

    // Save to Firestore
    await adminDb.collection('users').doc(uid).set({
      uid,
      email,
      balance: 0,
      totalTransactions: 0,
      isAdmin,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, uid });
  } catch (err: any) {
    const msg = err?.errorInfo?.message || err?.message || 'Registrasi gagal';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
