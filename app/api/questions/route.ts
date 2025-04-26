import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'

const prisma = new PrismaClient()

// GET - ดึงข้อมูลคำถามทั้งหมด หรือตามหมวดหมู่
export async function GET(request: Request) {
  try {
    console.log('เริ่มดึงข้อมูลคำถาม...')
    
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
    
    // ดึงพารามิเตอร์ categoryId จาก URL (ถ้ามี)
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    
    // เงื่อนไขการค้นหา
    const where = categoryId ? { categoryId } : {}
    
    // ดึงข้อมูลคำถาม
    const questions = await prisma.question.findMany({
      where,
      include: {
        category: true
      },
      orderBy: [
        { categoryId: 'asc' },
        { order: 'asc' }
      ]
    })
    
    console.log(`ดึงข้อมูลคำถามสำเร็จ: ${questions.length} รายการ`)
    
    return NextResponse.json(questions)
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำถาม:', error)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - สร้างคำถามใหม่
export async function POST(request: Request) {
  try {
    console.log('เริ่มสร้างคำถามใหม่...')
    
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
    if (!body.text || !body.categoryId) {
      console.log('ข้อมูลไม่ครบถ้วน')
      return NextResponse.json(
        { message: 'กรุณากรอกข้อมูลคำถามและหมวดหมู่' },
        { status: 400 }
      )
    }
    
    // ตรวจสอบว่ามีหมวดหมู่นี้หรือไม่
    const existingCategory = await prisma.category.findUnique({
      where: { id: body.categoryId }
    })
    
    if (!existingCategory) {
      console.log('ไม่พบหมวดหมู่ที่ระบุ')
      return NextResponse.json(
        { message: 'ไม่พบหมวดหมู่ที่ระบุ' },
        { status: 404 }
      )
    }
    
    // หาลำดับถัดไป (ถ้าไม่ได้ระบุมา) สำหรับคำถามในหมวดหมู่นี้
    if (!body.order) {
      const lastQuestion = await prisma.question.findFirst({
        where: { categoryId: body.categoryId },
        orderBy: { order: 'desc' }
      })
      body.order = lastQuestion ? (lastQuestion.order || 0) + 1 : 1
    }
    
    // สร้างคำถามใหม่
    const newQuestion = await prisma.question.create({
      data: {
        text: body.text,
        categoryId: body.categoryId,
        description: body.description,
        maxScore: body.maxScore ? parseFloat(body.maxScore) : null,
        minScore: body.minScore ? parseFloat(body.minScore) : null,
        weight: body.weight ? parseFloat(body.weight) : null,
        order: body.order,
        gradeA: body.gradeA,
        gradeB: body.gradeB,
        gradeC: body.gradeC,
        gradeD: body.gradeD,
        gradeE: body.gradeE
      }
    })
    
    console.log('สร้างคำถามใหม่สำเร็จ:', newQuestion)
    
    return NextResponse.json(newQuestion, { status: 201 })
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการสร้างคำถาม:', error)
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการสร้างคำถาม: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}