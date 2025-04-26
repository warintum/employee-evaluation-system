import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'

const prisma = new PrismaClient()

// GET - ดึงข้อมูลคำถามตาม ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`เริ่มดึงข้อมูลคำถาม ID: ${params.id}`)
    
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
    
    // ดึงข้อมูลคำถามตาม ID
    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        category: true
      }
    })
    
    if (!question) {
      console.log('ไม่พบคำถามที่ต้องการ')
      return NextResponse.json(
        { message: 'ไม่พบคำถามที่ต้องการ' },
        { status: 404 }
      )
    }
    
    console.log('ดึงข้อมูลคำถามสำเร็จ')
    
    return NextResponse.json(question)
  } catch (error: any) {
    console.error(`เกิดข้อผิดพลาดในการดึงข้อมูลคำถาม: ${error.message}`)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - อัปเดตข้อมูลคำถาม
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`เริ่มอัปเดตข้อมูลคำถาม ID: ${params.id}`)
    
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
    
    // ตรวจสอบว่ามีคำถามนี้หรือไม่
    const existingQuestion = await prisma.question.findUnique({
      where: { id: params.id }
    })
    
    if (!existingQuestion) {
      console.log('ไม่พบคำถามที่ต้องการอัปเดต')
      return NextResponse.json(
        { message: 'ไม่พบคำถามที่ต้องการอัปเดต' },
        { status: 404 }
      )
    }
    
    // รับข้อมูลจาก request
    const body = await request.json()
    console.log('ข้อมูลที่ส่งมาสำหรับอัปเดต:', body)
    
    // อัปเดตข้อมูลคำถาม
    const updatedQuestion = await prisma.question.update({
      where: { id: params.id },
      data: {
        text: body.text !== undefined ? body.text : undefined,
        categoryId: body.categoryId !== undefined ? body.categoryId : undefined,
        description: body.description !== undefined ? body.description : undefined,
        maxScore: body.maxScore !== undefined ? parseFloat(body.maxScore) : undefined,
        minScore: body.minScore !== undefined ? parseFloat(body.minScore) : undefined,
        weight: body.weight !== undefined ? parseFloat(body.weight) : undefined,
        order: body.order !== undefined ? body.order : undefined,
        gradeA: body.gradeA !== undefined ? body.gradeA : undefined,
        gradeB: body.gradeB !== undefined ? body.gradeB : undefined,
        gradeC: body.gradeC !== undefined ? body.gradeC : undefined,
        gradeD: body.gradeD !== undefined ? body.gradeD : undefined,
        gradeE: body.gradeE !== undefined ? body.gradeE : undefined,
      }
    })
    
    console.log('อัปเดตคำถามสำเร็จ:', updatedQuestion)
    
    return NextResponse.json(updatedQuestion)
  } catch (error: any) {
    console.error(`เกิดข้อผิดพลาดในการอัปเดตคำถาม: ${error.message}`)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการอัปเดตคำถาม: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - ลบคำถาม
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`เริ่มลบคำถาม ID: ${params.id}`)
    
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
    
    // ตรวจสอบว่าคำถามนี้มีการใช้งานในการประเมินหรือไม่
    const answersCount = await prisma.answer.count({
      where: { questionId: params.id }
    })
    
    if (answersCount > 0) {
      console.log('ไม่สามารถลบคำถามได้เนื่องจากมีการใช้งานในการประเมิน')
      return NextResponse.json(
        { message: 'ไม่สามารถลบคำถามได้เนื่องจากมีการใช้งานในการประเมิน' },
        { status: 400 }
      )
    }
    
    // ลบคำถาม
    await prisma.question.delete({
      where: { id: params.id }
    })
    
    console.log('ลบคำถามสำเร็จ')
    
    return NextResponse.json({ message: 'ลบคำถามสำเร็จ' })
  } catch (error: any) {
    console.error(`เกิดข้อผิดพลาดในการลบคำถาม: ${error.message}`)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการลบคำถาม: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}