import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getOperators } from '@/lib/rumahotp';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    await adminAuth.verifyIdToken(token);

    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || undefined;
    const provider_id = searchParams.get('provider_id') || undefined;

    const data = await getOperators(country, provider_id);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
