import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'

const prisma = new PrismaClient()

// GET - ดึงข้อมูลเทมเพลตตาม ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`เริ่มดึงข้อมูลเทมเพลต ID: ${params.id}`)
    
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
    
    // ดึงข้อมูลเทมเพลตตาม ID
    const template = await prisma.template.findUnique({
      where: { id: params.id },
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
    
    if (!template) {
      console.log('ไม่พบเทมเพลตที่ต้องการ')
      return NextResponse.json(
        { message: 'ไม่พบเทมเพลตที่ต้องการ' },
        { status: 404 }
      )
    }
    
    console.log('ดึงข้อมูลเทมเพลตสำเร็จ')
    
    return NextResponse.json(template)
  } catch (error: any) {
    console.error(`เกิดข้อผิดพลาดในการดึงข้อมูลเทมเพลต: ${error.message}`)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - อัปเดตข้อมูลเทมเพลต
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`เริ่มอัปเดตข้อมูลเทมเพลต ID: ${params.id}`)
    
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
    
    // ตรวจสอบว่ามีเทมเพลตนี้หรือไม่
    const existingTemplate = await prisma.template.findUnique({
      where: { id: params.id },
      include: { templateCategories: true }
    })
    
    if (!existingTemplate) {
      console.log('ไม่พบเทมเพลตที่ต้องการอัปเดต')
      return NextResponse.json(
        { message: 'ไม่พบเทมเพลตที่ต้องการอัปเดต' },
        { status: 404 }
      )
    }
    
    // รับข้อมูลจาก request
    const body = await request.json()
    console.log('ข้อมูลที่ส่งมาสำหรับอัปเดต:', body)
    
    // อัปเดตข้อมูลเทมเพลต
    let updatedTemplate

    // ใช้ transaction เพื่อให้แน่ใจว่าการอัปเดตทั้งหมดสำเร็จหรือล้มเหลวพร้อมกัน
    await prisma.$transaction(async (tx) => {
      // อัปเดตข้อมูลพื้นฐานของเทมเพลต
      updatedTemplate = await tx.template.update({
        where: { id: params.id },
        data: {
          name: body.name !== undefined ? body.name : undefined,
          description: body.description !== undefined ? body.description : undefined,
          position: body.position !== undefined ? body.position : undefined,
          isActive: body.isActive !== undefined ? body.isActive : undefined,
        }
      })
      
      // ถ้ามีการอัปเดตหมวดหมู่
      if (body.categories && Array.isArray(body.categories)) {
        // ลบความสัมพันธ์เดิม
        await tx.templateCategory.deleteMany({
          where: { templateId: params.id }
        })
        
        // สร้างความสัมพันธ์ใหม่
        for (let i = 0; i < body.categories.length; i++) {
          await tx.templateCategory.create({
            data: {
              templateId: params.id,
              categoryId: body.categories[i].id,
              order: i + 1
            }
          })
        }
      }
    })
    
    // ดึงข้อมูลที่อัปเดตแล้วพร้อมความสัมพันธ์
    const result = await prisma.template.findUnique({
      where: { id: params.id },
      include: {
        templateCategories: {
          include: {
            category: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })
    
    console.log('อัปเดตเทมเพลตสำเร็จ')
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error(`เกิดข้อผิดพลาดในการอัปเดตเทมเพลต: ${error.message}`)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการอัปเดตเทมเพลต: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - ลบเทมเพลต
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`เริ่มลบเทมเพลต ID: ${params.id}`)
    
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
    
    // ใช้ transaction เพื่อให้แน่ใจว่าการลบทั้งหมดสำเร็จหรือล้มเหลวพร้อมกัน
    await prisma.$transaction(async (tx) => {
      // ลบความสัมพันธ์กับหมวดหมู่ก่อน
      await tx.templateCategory.deleteMany({
        where: { templateId: params.id }
      })
      
      // ลบเทมเพลต
      await tx.template.delete({
        where: { id: params.id }
      })
    })
    
    console.log('ลบเทมเพลตสำเร็จ')
    
    return NextResponse.json({ message: 'ลบเทมเพลตสำเร็จ' })
  } catch (error: any) {
    console.error(`เกิดข้อผิดพลาดในการลบเทมเพลต: ${error.message}`)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการลบเทมเพลต: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}