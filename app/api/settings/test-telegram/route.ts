import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'
import { sendTelegramNotification } from '@/app/lib/telegram'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    // ตรวจสอบสิทธิ์การเข้าถึง
    const token = (await cookies()).get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { message: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      )
    }
    
    const decodedToken = verifyToken(token)
    
    if (!decodedToken || !decodedToken.id) {
      return NextResponse.json(
        { message: 'Token ไม่ถูกต้องหรือหมดอายุ' },
        { status: 401 }
      )
    }
    
    // ดึงข้อมูลผู้ใช้
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }
    
    // ตรวจสอบว่าผู้ใช้เป็น Admin หรือไม่
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์เข้าถึงข้อมูล' },
        { status: 403 }
      )
    }
    
    // ส่งข้อความทดสอบ
    const message = `
<b>🧪 ทดสอบการแจ้งเตือน Telegram</b>

ผู้ทดสอบ: ${user.firstName} ${user.lastName}
เวลา: ${new Date().toLocaleString('th-TH')}

<i>หากคุณได้รับข้อความนี้ แสดงว่าการตั้งค่า Telegram ของคุณถูกต้องและพร้อมใช้งาน</i>
`
    
    const success = await sendTelegramNotification(message)
    
    if (success) {
      return NextResponse.json({
        message: 'ส่งข้อความทดสอบ Telegram สำเร็จ'
      })
    } else {
      return NextResponse.json(
        { message: 'เกิดข้อผิดพลาดในการส่งข้อความ Telegram กรุณาตรวจสอบการตั้งค่า' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Test Telegram error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการทดสอบส่งข้อความ Telegram' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}