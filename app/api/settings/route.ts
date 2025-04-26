import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'

const prisma = new PrismaClient()

// ดึงการตั้งค่าทั้งหมด
export async function GET(request: Request) {
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
    
    // ดึงข้อมูลการตั้งค่าทั้งหมด
    const settings = await prisma.setting.findMany({
      orderBy: {
        key: 'asc',
      },
    })
    
    return NextResponse.json({ settings })
  } catch (error: any) {
    console.error('Get settings error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// บันทึกการตั้งค่า
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
    const { settings } = await request.json()
    
    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { message: 'ข้อมูลไม่ถูกต้อง' },
        { status: 400 }
      )
    }
    
    // บันทึกการตั้งค่า
    const updates = []
    
    for (const setting of settings) {
      updates.push(
        prisma.setting.update({
          where: { id: setting.id },
          data: { value: setting.value }
        })
      )
    }
    
    await Promise.all(updates)
    
    return NextResponse.json({
      message: 'บันทึกการตั้งค่าสำเร็จ'
    })
  } catch (error: any) {
    console.error('Update settings error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}