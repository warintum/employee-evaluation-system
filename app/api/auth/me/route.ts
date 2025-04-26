import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // ดึง token จาก cookies
    const cookiesInstance = await cookies()
    const token = cookiesInstance.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { message: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      )
    }
    
    // ตรวจสอบ token
    const decodedToken = verifyToken(token)
    
    if (!decodedToken || !decodedToken.id) {
      // ถ้า token ไม่ถูกต้องหรือหมดอายุ ให้ลบ cookie
      cookiesInstance.delete('token')
      
      return NextResponse.json(
        { message: 'Token ไม่ถูกต้องหรือหมดอายุ' },
        { status: 401 }
      )
    }
    
    // ดึงข้อมูลผู้ใช้จาก id ใน token
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
    })
    
    if (!user) {
      cookiesInstance.delete('token')
      
      return NextResponse.json(
        { message: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }
    
    // ตรวจสอบว่าผู้ใช้ยังเปิดใช้งานอยู่หรือไม่
    if (!user.isActive) {
      cookiesInstance.delete('token')
      
      return NextResponse.json(
        { message: 'บัญชีนี้ถูกระงับการใช้งาน' },
        { status: 403 }
      )
    }
    
    // ส่งข้อมูลผู้ใช้กลับไป (ยกเว้นรหัสผ่าน)
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: userWithoutPassword
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}