import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'

const prisma = new PrismaClient()

// GET - ดึงข้อมูลหมวดหมู่ทั้งหมด
export async function GET() {
  try {
    console.log('เริ่มดึงข้อมูลหมวดหมู่...')
    
    // ตรวจสอบสิทธิ์การเข้าถึง (เฉพาะผู้ดูแลระบบและ HR)
    const cookiesInstance = await cookies()
    const token = cookiesInstance.get('token')?.value
    
    if (!token) {
      console.log('ไม่พบ token - ไม่ได้เข้าสู่ระบบ')
      return NextResponse.json(
        { message: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      )
    }
    
    const decodedToken = verifyToken(token)
    if (!decodedToken || !decodedToken.id) {
      console.log('Token ไม่ถูกต้องหรือหมดอายุ')
      return NextResponse.json(
        { message: 'Token ไม่ถูกต้องหรือหมดอายุ' },
        { status: 401 }
      )
    }
    
    // ตรวจสอบบทบาท (role)
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      select: { role: true }
    })
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_HR')) {
      console.log('ไม่มีสิทธิ์เข้าถึงข้อมูล')
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์เข้าถึงข้อมูล' },
        { status: 403 }
      )
    }
    
    // ดึงข้อมูลหมวดหมู่ทั้งหมด พร้อมคำถาม
    const categories = await prisma.category.findMany({
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })
    
    console.log(`ดึงข้อมูลหมวดหมู่สำเร็จ: ${categories.length} รายการ`)
    
    return NextResponse.json(categories)
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่:', error)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - สร้างหมวดหมู่ใหม่
export async function POST(request: Request) {
  try {
    console.log('เริ่มสร้างหมวดหมู่ใหม่...')
    
    // ตรวจสอบสิทธิ์การเข้าถึง (เฉพาะผู้ดูแลระบบและ HR)
    const cookiesInstance = await cookies()
    const token = cookiesInstance.get('token')?.value
    
    if (!token) {
      console.log('ไม่พบ token - ไม่ได้เข้าสู่ระบบ')
      return NextResponse.json(
        { message: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      )
    }
    
    const decodedToken = verifyToken(token)
    if (!decodedToken || !decodedToken.id) {
      console.log('Token ไม่ถูกต้องหรือหมดอายุ')
      return NextResponse.json(
        { message: 'Token ไม่ถูกต้องหรือหมดอายุ' },
        { status: 401 }
      )
    }
    
    // ตรวจสอบบทบาท (role)
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      select: { role: true }
    })
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_HR')) {
      console.log('ไม่มีสิทธิ์เข้าถึงข้อมูล')
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์เข้าถึงข้อมูล' },
        { status: 403 }
      )
    }
    
    // รับข้อมูลจาก request
    const body = await request.json()
    console.log('ข้อมูลที่ส่งมา:', body)
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!body.name || !body.position) {
      console.log('ข้อมูลไม่ครบถ้วน')
      return NextResponse.json(
        { message: 'กรุณากรอกข้อมูลชื่อหมวดหมู่และตำแหน่งที่เกี่ยวข้อง' },
        { status: 400 }
      )
    }
    
    // หาลำดับถัดไป (ถ้าไม่ได้ระบุมา)
    if (!body.order) {
      const lastCategory = await prisma.category.findFirst({
        orderBy: { order: 'desc' }
      })
      body.order = lastCategory ? (lastCategory.order || 0) + 1 : 1
    }
    
    // สร้างหมวดหมู่ใหม่
    const newCategory = await prisma.category.create({
      data: {
        name: body.name,
        description: body.description,
        position: body.position,
        maxScore: body.maxScore ? parseFloat(body.maxScore) : null,
        weight: body.weight ? parseFloat(body.weight) : null,
        order: body.order
      }
    })
    
    console.log('สร้างหมวดหมู่ใหม่สำเร็จ:', newCategory)
    
    return NextResponse.json(newCategory, { status: 201 })
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการสร้างหมวดหมู่:', error)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการสร้างหมวดหมู่: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}