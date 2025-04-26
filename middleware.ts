import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// ไม่ใช้ verifyToken จาก utils.ts
// import { verifyToken } from './app/lib/utils'
import * as jose from 'jose' // ต้องติดตั้ง npm install jose

// รายชื่อเส้นทางที่ไม่ต้องตรวจสอบการเข้าสู่ระบบ
const publicPaths = ['/login', '/reset-password']

// รายชื่อเส้นทางที่ต้องมีสิทธิ์เฉพาะ
const adminPaths = [
  '/employees', 
  '/settings', 
  '/categories',
  '/attendance'
]

// ฟังก์ชันสำหรับตรวจสอบ token ใน middleware (edge-compatible)
async function verifyTokenEdge(token: string) {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'default-secret-key'
    )
    
    const { payload } = await jose.jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error('Edge token verification error:', error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log("\n--- Middleware executing for path:", pathname, "---")
  
  // ถ้าเป็นเส้นทาง API ให้ข้ามการตรวจสอบใน middleware
  if (pathname.startsWith('/api')) {
    console.log("Skipping middleware check for API path")
    return NextResponse.next()
  }
  
  // ถ้าเป็นเส้นทางของไฟล์ static ให้ข้ามการตรวจสอบ
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    console.log("Skipping middleware check for static file")
    return NextResponse.next()
  }
  
  // ดึง token จาก cookies
  const token = request.cookies.get('token')?.value
  console.log("Token exists in cookies:", !!token)
  
  // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้วหรือไม่
  const isAuthenticated = token ? await verifyTokenEdge(token) : null
  console.log("Authentication result:", isAuthenticated ? "Authenticated" : "Not authenticated")
  
  // หากผู้ใช้ไม่ได้เข้าสู่ระบบและพยายามเข้าถึงเส้นทางที่ต้องเข้าสู่ระบบ
  if (!isAuthenticated && !publicPaths.some(path => pathname.startsWith(path))) {
    console.log("Redirecting to /login - Not authenticated for protected path:", pathname)
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // หากผู้ใช้เข้าสู่ระบบแล้วและพยายามเข้าถึงเส้นทางสาธารณะ (เช่น /login)
  if (isAuthenticated && publicPaths.some(path => pathname.startsWith(path))) {
    console.log("Redirecting to /dashboard from public path")
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // ตรวจสอบสิทธิ์การเข้าถึงสำหรับเส้นทางเฉพาะ Admin
  if (isAuthenticated && adminPaths.some(path => pathname.startsWith(path))) {
    const role = isAuthenticated.role as string

    // ถ้าไม่ใช่ Admin หรือ Admin HR ให้เปลี่ยนเส้นทางไปยังหน้าแดชบอร์ด
    if (role !== 'ADMIN' && role !== 'ADMIN_HR') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // ถ้าเป็นหน้าตั้งค่า ตรวจสอบว่าต้องเป็น Admin เท่านั้น
    if (pathname.startsWith('/settings') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  console.log("Middleware check passed, continuing to page:", pathname)
  return NextResponse.next()
}

// กำหนดให้ middleware ทำงานกับทุกเส้นทาง
export const config = {
  matcher: '/:path*',
}