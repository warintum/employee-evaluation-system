import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateToken } from '@/app/lib/utils'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// ฟังก์ชันสำหรับส่งอีเมลรีเซ็ตรหัสผ่าน
async function sendResetPasswordEmail(email: string, resetToken: string) {
  // สร้าง transporter สำหรับส่งอีเมล
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  // URL สำหรับรีเซ็ตรหัสผ่าน
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/new-password?token=${resetToken}`

  // สร้าง template อีเมล
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'HR Evalify - รีเซ็ตรหัสผ่านของคุณ',
    html: `
      <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4338ca; margin-bottom: 10px;">รีเซ็ตรหัสผ่านของคุณ</h1>
          <p style="color: #666;">คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชี HR Evalify ของคุณ</p>
        </div>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" style="background: linear-gradient(to right, #3b82f6, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">ตั้งรหัสผ่านใหม่</a>
        </div>
        <div style="margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 14px; color: #666;">
          <p>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน คุณสามารถละเลยอีเมลนี้ได้</p>
          <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
        </div>
      </div>
    `,
  }

  // ส่งอีเมล
  await transporter.sendMail(mailOptions)
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // ตรวจสอบว่ามีการส่งอีเมลมาหรือไม่
    if (!email) {
      return NextResponse.json(
        { message: 'กรุณากรอกอีเมลของคุณ' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่ามีผู้ใช้ที่ใช้อีเมลนี้หรือไม่
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // ถ้าไม่พบผู้ใช้ ไม่ต้องแจ้งให้ผู้ใช้ทราบเพื่อความปลอดภัย
    // แต่ยังคงส่งคำตอบกลับเหมือนว่าส่งอีเมลสำเร็จ
    if (!user || !user.isActive) {
      return NextResponse.json({
        message: 'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณ',
      })
    }

    // สร้าง token สำหรับรีเซ็ตรหัสผ่าน (กำหนดอายุ 1 ชั่วโมง)
    const resetToken = generateToken({
      id: user.id,
      email: user.email,
      type: 'password-reset',
    })

    // บันทึก token และเวลาหมดอายุใน DB (ถ้าต้องการเพิ่มความปลอดภัย)
    // ในตัวอย่างนี้ ใช้วิธีเก็บข้อมูลใน token แทน

    // ส่งอีเมลรีเซ็ตรหัสผ่าน
    await sendResetPasswordEmail(user.email, resetToken)

    return NextResponse.json({
      message: 'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณ',
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}