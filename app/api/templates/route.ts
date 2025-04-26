import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'

const prisma = new PrismaClient()

// GET - ดึงข้อมูลเทมเพลตทั้งหมด
export async function GET() {
  try {
    console.log('เริ่มดึงข้อมูลเทมเพลต...')
    
    // ตรวจสอบสิทธิ์การเข้าถึง
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
    
    // ดึงข้อมูลเทมเพลตทั้งหมด
    const templates = await prisma.template.findMany({
      include: {
        templateCategories: {
          include: {
            category: {
              include: {
                questions: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })
    
    console.log(`ดึงข้อมูลเทมเพลตสำเร็จ: ${templates.length} รายการ`)
    
    return NextResponse.json(templates)
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเทมเพลต:', error)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - สร้างเทมเพลตใหม่
export async function POST(request: Request) {
  try {
    console.log('เริ่มสร้างเทมเพลตใหม่...')
    
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
    if (!body.name || !body.position || !body.categories || !Array.isArray(body.categories)) {
      console.log('ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง')
      return NextResponse.json(
        { message: 'กรุณากรอกข้อมูลชื่อเทมเพลต ตำแหน่ง และหมวดหมู่' },
        { status: 400 }
      )
    }
    
    // สร้างเทมเพลตใหม่พร้อมความสัมพันธ์
    const newTemplate = await prisma.template.create({
      data: {
        name: body.name,
        description: body.description,
        position: body.position,
        isActive: body.isActive !== undefined ? body.isActive : true,
        templateCategories: {
          create: body.categories.map((category: any, index: number) => ({
            categoryId: category.id,
            order: index + 1
          }))
        }
      },
      include: {
        templateCategories: {
          include: {
            category: true
          }
        }
      }
    })
    
    console.log('สร้างเทมเพลตใหม่สำเร็จ:', newTemplate)
    
    return NextResponse.json(newTemplate, { status: 201 })
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการสร้างเทมเพลต:', error)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการสร้างเทมเพลต: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}