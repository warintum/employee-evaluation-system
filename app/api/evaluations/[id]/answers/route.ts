import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'

const prisma = new PrismaClient()

// บันทึกคำตอบการประเมิน
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params // ID ของการประเมิน
    
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
    
    // ดึงข้อมูลการประเมิน
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
    })
    
    if (!evaluation) {
      return NextResponse.json(
        { message: 'ไม่พบข้อมูลการประเมิน' },
        { status: 404 }
      )
    }
    
    // ตรวจสอบว่าผู้ใช้เป็นผู้ประเมินของการประเมินนี้หรือไม่
    if (user.id !== evaluation.evaluatorId && user.role !== 'ADMIN' && user.role !== 'ADMIN_HR') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์บันทึกคำตอบการประเมินนี้' },
        { status: 403 }
      )
    }
    
    // ตรวจสอบสถานะของการประเมิน (ต้องอยู่ในสถานะ EVALUATOR_EVALUATING หรือ REJECTED เท่านั้น)
    if (evaluation.status !== 'EVALUATOR_EVALUATING' && evaluation.status !== 'REJECTED') {
      return NextResponse.json(
        { message: 'ไม่สามารถบันทึกคำตอบในสถานะปัจจุบันของการประเมินได้' },
        { status: 400 }
      )
    }
    
    // ดึงข้อมูลจาก request body
    const { answers } = await request.json()
    
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { message: 'กรุณาระบุคำตอบอย่างน้อย 1 รายการ' },
        { status: 400 }
      )
    }
    
    // ตรวจสอบความถูกต้องของข้อมูลคำตอบ
    for (const answer of answers) {
      if (!answer.questionId || answer.score === undefined || answer.score === null) {
        return NextResponse.json(
          { message: 'กรุณาระบุ questionId และ score ให้ครบถ้วน' },
          { status: 400 }
        )
      }
      
      if (typeof answer.score !== 'number' || answer.score < 0 || answer.score > 5) {
        return NextResponse.json(
          { message: 'คะแนนต้องเป็นตัวเลขระหว่าง 0-5' },
          { status: 400 }
        )
      }
    }
    
    // เริ่ม transaction เพื่อบันทึกคำตอบทั้งหมด
    const createdAnswers = await prisma.$transaction(async (tx) => {
      // ลบคำตอบเดิมทั้งหมดของการประเมินนี้ (ถ้ามี)
      await tx.answer.deleteMany({
        where: { evaluationId: id },
      })
      
      // สร้างคำตอบใหม่ทั้งหมด
      const newAnswers = []
      
      for (const answer of answers) {
        const newAnswer = await tx.answer.create({
          data: {
            evaluationId: id,
            questionId: answer.questionId,
            score: answer.score,
            comment: answer.comment || null,
          },
        })
        
        newAnswers.push(newAnswer)
      }
      
      return newAnswers
    })
    
    return NextResponse.json({
      message: 'บันทึกคำตอบการประเมินสำเร็จ',
      answers: createdAnswers,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create answers error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการบันทึกคำตอบการประเมิน' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// ดึงคำตอบการประเมินทั้งหมดของการประเมินนี้
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params // ID ของการประเมิน
    
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
    
    // ดึงข้อมูลการประเมิน
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        evaluee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        evaluator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
      }
    })
    
    if (!evaluation) {
      return NextResponse.json(
        { message: 'ไม่พบข้อมูลการประเมิน' },
        { status: 404 }
      )
    }
    
    // ตรวจสอบสิทธิ์การเข้าถึงข้อมูลการประเมิน
    const isAdminUser = user.role === 'ADMIN' || user.role === 'ADMIN_HR'
    const isEvaluee = user.id === evaluation.evalueeId
    const isEvaluator = user.id === evaluation.evaluatorId
    const isReviewer = user.id === evaluation.reviewerId
    const isManager = user.id === evaluation.managerId
    
    if (!isAdminUser && !isEvaluee && !isEvaluator && !isReviewer && !isManager) {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลคำตอบการประเมินนี้' },
        { status: 403 }
      )
    }
    
    // สำหรับ USER (ผู้ถูกประเมิน) จะเข้าถึงข้อมูลได้ต่อเมื่อการประเมินเสร็จสิ้นแล้วเท่านั้น
    if (isEvaluee && user.role === 'USER' && evaluation.status !== 'COMPLETED') {
      return NextResponse.json(
        { message: 'ไม่สามารถเข้าถึงข้อมูลคำตอบการประเมินที่ยังไม่เสร็จสิ้น' },
        { status: 403 }
      )
    }
    
    // ดึงข้อมูลคำตอบทั้งหมดของการประเมินนี้
    const answers = await prisma.answer.findMany({
      where: { evaluationId: id },
      include: {
        question: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        question: {
          categoryId: 'asc'
        }
      }
    })
    
    // จัดกลุ่มคำตอบตามหมวดหมู่
    const answersByCategory: Record<string, any> = {}
    
    for (const answer of answers) {
      const categoryId = answer.question.categoryId
      const categoryName = answer.question.category.name
      
      if (!answersByCategory[categoryId]) {
        answersByCategory[categoryId] = {
          id: categoryId,
          name: categoryName,
          description: answer.question.category.description,
          answers: []
        }
      }
      
      answersByCategory[categoryId].answers.push({
        id: answer.id,
        questionId: answer.questionId,
        questionText: answer.question.text,
        score: answer.score,
        comment: answer.comment,
      })
    }
    
    // แปลงเป็น array
    const categorizedAnswers = Object.values(answersByCategory)
    
    return NextResponse.json({
      evaluation: {
        id: evaluation.id,
        year: evaluation.year,
        period: evaluation.period,
        status: evaluation.status,
        evaluee: evaluation.evaluee,
        evaluator: evaluation.evaluator,
      },
      categories: categorizedAnswers,
    })
  } catch (error: any) {
    console.error('Get answers error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำตอบการประเมิน' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}