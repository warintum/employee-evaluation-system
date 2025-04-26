import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'
import { sendEmail } from '@/app/lib/email'

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
    
    // ดึงข้อมูลจาก request body
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { message: 'กรุณาระบุอีเมลที่ต้องการทดสอบ' },
        { status: 400 }
      )
    }
    
    // ดึงการตั้งค่าอีเมล
    const emailSettings = await prisma.setting.findMany({
      where: {
        key: {
          contains: 'EMAIL'
        }
      }
    })
    
    // ตรวจสอบว่ามีการตั้งค่าครบถ้วนหรือไม่
    const requiredKeys = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM']
    const settingMap = new Map()
    
    emailSettings.forEach(setting => {
      settingMap.set(setting.key, setting.value)
    })
    
    for (const key of requiredKeys) {
      if (!settingMap.has(key) || !settingMap.get(key)) {
        return NextResponse.json(
          { message: `กรุณาตั้งค่า ${key} ก่อนทดสอบการส่งอีเมล` },
          { status: 400 }
        )
      }
    }
    
    // ส่งอีเมลทดสอบ
    const subject = 'HR Evalify - ทดสอบการส่งอีเมล'
    const html = `
      <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4338ca; margin-bottom: 10px;">ทดสอบการส่งอีเมล</h1>
          <p style="color: #666;">สวัสดี ${user.firstName} ${user.lastName}</p>
        </div>
        
        <div style="margin-bottom: 20px; color: #333;">
          <p>นี่เป็นอีเมลทดสอบจากระบบ HR Evalify</p>
          <p>หากคุณได้รับอีเมลนี้ แสดงว่าการตั้งค่าอีเมลของคุณถูกต้องและพร้อมใช้งาน</p>
        </div>
        
        <div style="margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 14px; color: #666;">
          <p>อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
          <p>เวลาที่ทดสอบ: ${new Date().toLocaleString('th-TH')}</p>
        </div>
      </div>
    `
    
    const success = await sendEmail(email, subject, html)
    
    if (success) {
      return NextResponse.json({
        message: 'ส่งอีเมลทดสอบสำเร็จ'
      })
    } else {
      return NextResponse.json(
        { message: 'เกิดข้อผิดพลาดในการส่งอีเมล กรุณาตรวจสอบการตั้งค่า' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Test email error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการทดสอบส่งอีเมล' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}