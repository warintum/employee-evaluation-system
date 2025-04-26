import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'

const prisma = new PrismaClient()

// GET - ดึงข้อมูลหมวดหมู่ตาม ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`เริ่มดึงข้อมูลหมวดหมู่ ID: ${params.id}`)
    
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
    
    // ดึงข้อมูลหมวดหมู่ตาม ID พร้อมคำถาม
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })
    
    if (!category) {
      console.log('ไม่พบหมวดหมู่ที่ต้องการ')
      return NextResponse.json(
        { message: 'ไม่พบหมวดหมู่ที่ต้องการ' },
        { status: 404 }
      )
    }
    
    console.log('ดึงข้อมูลหมวดหมู่สำเร็จ')
    
    return NextResponse.json(category)
  } catch (error: any) {
    console.error(`เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่: ${error.message}`)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - อัปเดตข้อมูลหมวดหมู่
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`เริ่มอัปเดตข้อมูลหมวดหมู่ ID: ${params.id}`)
    
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
    
    // ตรวจสอบว่ามีหมวดหมู่นี้หรือไม่
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id }
    })
    
    if (!existingCategory) {
      console.log('ไม่พบหมวดหมู่ที่ต้องการอัปเดต')
      return NextResponse.json(
        { message: 'ไม่พบหมวดหมู่ที่ต้องการอัปเดต' },
        { status: 404 }
      )
    }
    
    // รับข้อมูลจาก request
    const body = await request.json()
    console.log('ข้อมูลที่ส่งมาสำหรับอัปเดต:', body)
    
    // อัปเดตข้อมูลหมวดหมู่
    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        description: body.description !== undefined ? body.description : undefined,
        position: body.position !== undefined ? body.position : undefined,
        maxScore: body.maxScore !== undefined ? parseFloat(body.maxScore) : undefined,
        weight: body.weight !== undefined ? parseFloat(body.weight) : undefined,
        order: body.order !== undefined ? body.order : undefined
      }
    })
    
    console.log('อัปเดตหมวดหมู่สำเร็จ:', updatedCategory)
    
    return NextResponse.json(updatedCategory)
  } catch (error: any) {
    console.error(`เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่: ${error.message}`)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - ลบหมวดหมู่
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`เริ่มลบหมวดหมู่ ID: ${params.id}`)
    
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
    
    // ตรวจสอบว่าหมวดหมู่นี้มีคำถามหรือไม่
    const questionsCount = await prisma.question.count({
      where: { categoryId: params.id }
    })
    
    if (questionsCount > 0) {
      console.log('ไม่สามารถลบหมวดหมู่ได้เนื่องจากมีคำถามที่เกี่ยวข้อง')
      return NextResponse.json(
        { message: 'ไม่สามารถลบหมวดหมู่ได้เนื่องจากมีคำถามที่เกี่ยวข้อง กรุณาลบคำถามทั้งหมดก่อน' },
        { status: 400 }
      )
    }
    
    // ลบหมวดหมู่
    await prisma.category.delete({
      where: { id: params.id }
    })
    
    console.log('ลบหมวดหมู่สำเร็จ')
    
    return NextResponse.json({ message: 'ลบหมวดหมู่สำเร็จ' })
  } catch (error: any) {
    console.error(`เกิดข้อผิดพลาดในการลบหมวดหมู่: ${error.message}`)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการลบหมวดหมู่: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}