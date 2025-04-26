import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { comparePassword, generateToken } from '@/app/lib/utils'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, password, remember } = await request.json()

    // ตรวจสอบว่ามีการส่งข้อมูลครบถ้วนหรือไม่
    if (!email || !password) {
      return NextResponse.json(
        { message: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        { status: 400 }
      )
    }

    // ค้นหาผู้ใช้จาก email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // ถ้าไม่พบผู้ใช้
    if (!user) {
      return NextResponse.json(
        { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    // ตรวจสอบว่าผู้ใช้ยังใช้งานอยู่หรือไม่
    if (!user.isActive) {
      return NextResponse.json(
        { message: 'บัญชีนี้ถูกระงับการใช้งาน' },
        { status: 403 }
      )
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    // สร้าง JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    // สร้าง cookie options
    /*const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      // ถ้าผู้ใช้เลือก "จดจำฉัน" ให้ cookie หมดอายุใน 30 วัน
      // ถ้าไม่ได้เลือก ให้ cookie หมดอายุเมื่อปิดเบราว์เซอร์ (session cookie)
      maxAge: remember ? 30 * 24 * 60 * 60 : undefined,
      sameSite: 'strict' as const,
    }

    // ดึง cookies instance 
    const cookiesInstance = await cookies()
    // กำหนด cookie
    cookiesInstance.set('token', token, cookieOptions)
    */
    // สร้าง cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: false, // กำหนดเป็น false เพื่อทดสอบในการพัฒนา
      path: '/',
      maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // ถ้าไม่ได้เลือก remember ให้หมดอายุใน 1 วัน
      sameSite: 'lax' as const, // เปลี่ยนเป็น lax เพื่อให้ทำงานได้ดีกับ redirects
    };

    // ดึง cookies instance 
    const cookiesInstance = await cookies()
    // กำหนด cookie
    cookiesInstance.set('token', token, cookieOptions)

    // ลอง log เพื่อตรวจสอบว่า cookie ถูกกำหนดหรือไม่
    console.log("Cookie set with token:", token.substring(0, 10) + "...")

    // ส่งข้อมูลผู้ใช้กลับไป (ยกเว้นรหัสผ่าน)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: userWithoutPassword,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}