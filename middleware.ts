import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // هنا حدد الصفحة اللي عاوز تحميها، مثلا صفحة الإعدادات
  if (request.nextUrl.pathname.startsWith('/settings')) {
    const basicAuth = request.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // هنا حط اسم المستخدم وكلمة السر اللي إنت عاوزها
      if (user === 'admin' && pwd === '1234567890123451234123121') {
        return NextResponse.next();
      }
    }

    return new NextResponse('Auth Required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic' },
    });
  }

  return NextResponse.next();
}