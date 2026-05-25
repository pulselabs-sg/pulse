import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('next-auth.session-token')?.value || 
                  cookieStore.get('__Secure-next-auth.session-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No session token found' }, { status: 401 });
    }

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('Error fetching mobile token:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
