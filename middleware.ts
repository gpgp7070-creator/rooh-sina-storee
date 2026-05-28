import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // جربنا نغير الشرط عشان يكون أكثر شمولاً
  if (request.nextUrl.pathname.includes('/settings')) {
    const basicAuth = request.headers.get('authorization');

    if (!basicAuth) {
      return new NextResponse('Auth Required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic' },
      });
    }

    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (user === 'admin' && pwd === '1234567890123451234123121') {
      return NextResponse.next();
    }

    return new NextResponse('Invalid Credentials', { status: 401 });
  }

  return NextResponse.next();
}