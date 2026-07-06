import { NextResponse, type NextRequest } from 'next/server';

// Route ที่เปิด public ไม่ต้องผ่านการตรวจสอบใด ๆ
const PUBLIC_PATHS = ['/api/sub-version', '/api/data-sync-in'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // TODO: เพิ่ม logic ตรวจสอบสิทธิ์สำหรับ route ที่ต้อง protect ที่นี่
  return NextResponse.next();
}

export const config = {
  // ไม่จับไฟล์ static, รูปภาพ และ favicon
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp)$).*)'],
};
