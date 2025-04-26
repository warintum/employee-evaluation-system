import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken, calculateAverageScore, calculateGrade } from '@/app/lib/utils'
import { 
  sendReviewNotification, 
  sendEvaluationResultNotification,
  sendRejectedEvaluationNotification
} from '@/app/lib/email'
import { notifyCompletedEvaluation } from '@/app/lib/telegram'

const prisma = new PrismaClient()

// ดึงข้อมูลการประเมินตาม ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
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
            employeeId: true,
            position: true,
            department: true,
            email: true,
          }
        },
        evaluator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            email: true,
          }
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            email: true,
          }
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            email: true,
          }
        },
        answers: {
          include: {
            question: {
              include: {
                category: true
              }
            }
          }
        }
      },
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
        { message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลการประเมินนี้' },
        { status: 403 }
      )
    }
    
    // สำหรับ USER จะเข้าถึงข้อมูลได้ต่อเมื่อการประเมินเสร็จสิ้นแล้วเท่านั้น
    if (isEvaluee && user.role === 'USER' && evaluation.status !== 'COMPLETED') {
      // ยกเว้นถ้าการประเมินอยู่ในสถานะ SELF_EVALUATING และอนุญาตให้ประเมินตนเอง
      if (!(evaluation.status === 'SELF_EVALUATING' && evaluation.allowSelfEvaluation)) {
        return NextResponse.json(
          { message: 'ไม่สามารถเข้าถึงข้อมูลการประเมินที่ยังไม่เสร็จสิ้น' },
          { status: 403 }
        )
      }
    }
    
    return NextResponse.json(evaluation)
  } catch (error: any) {
    console.error('Get evaluation error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการประเมิน' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// อัพเดทข้อมูลการประเมิน
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
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
            email: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        },
        evaluator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        reviewer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        manager: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        answers: true
      }
    })
    
    if (!evaluation) {
      return NextResponse.json(
        { message: 'ไม่พบข้อมูลการประเมิน' },
        { status: 404 }
      )
    }
    
    // ตรวจสอบสิทธิ์การแก้ไขข้อมูลการประเมิน
    const isAdminUser = user.role === 'ADMIN' || user.role === 'ADMIN_HR'
    const isEvaluator = user.id === evaluation.evaluatorId
    const isReviewer = user.id === evaluation.reviewerId
    const isManager = user.id === evaluation.managerId
    
    // ดึงข้อมูลจาก request body
    const updateData = await request.json()
    
    // กำหนดข้อมูลที่อนุญาตให้อัพเดท
    const dataToUpdate: any = {}
    
    // สำหรับ Admin/HR สามารถอัพเดทข้อมูลพื้นฐานของการประเมินได้
    if (isAdminUser) {
      if (updateData.year) dataToUpdate.year = updateData.year
      if (updateData.period) dataToUpdate.period = updateData.period
      if (updateData.evalueeId) dataToUpdate.evalueeId = updateData.evalueeId
      if (updateData.evaluatorId) dataToUpdate.evaluatorId = updateData.evaluatorId
      if (updateData.reviewerId) dataToUpdate.reviewerId = updateData.reviewerId
      if (updateData.managerId) dataToUpdate.managerId = updateData.managerId
      if (updateData.status) dataToUpdate.status = updateData.status
      if (updateData.allowSelfEvaluation !== undefined) dataToUpdate.allowSelfEvaluation = updateData.allowSelfEvaluation
    }
    
    // ประมวลผลตามสถานะและบทบาทของผู้ใช้
    // 1. ผู้ประเมิน (EVALUATOR)
    if (isEvaluator && (evaluation.status === 'EVALUATOR_EVALUATING' || evaluation.status === 'REJECTED')) {
      // ผู้ประเมินสามารถอนุมัติการประเมินและเพิ่มความคิดเห็นได้
      if (updateData.evaluatorApproved !== undefined) {
        dataToUpdate.evaluatorApproved = updateData.evaluatorApproved
        
        // ถ้าอนุมัติ ให้เปลี่ยนสถานะและส่งต่อไปยังผู้ตรวจสอบ
        if (updateData.evaluatorApproved) {
          dataToUpdate.status = 'REVIEWER_REVIEWING'
          
          // ส่งอีเมลแจ้งเตือนไปยังผู้ตรวจสอบ
          const reviewUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/evaluations/${evaluation.id}`
          
          await sendReviewNotification(
            evaluation.reviewer.email,
            `${evaluation.reviewer.firstName} ${evaluation.reviewer.lastName}`,
            `${evaluation.evaluator.firstName} ${evaluation.evaluator.lastName}`,
            1, // จำนวนพนักงานที่ถูกประเมิน
            `${evaluation.period}/${evaluation.year}`,
            reviewUrl
          )
        }
      }
      
      if (updateData.evaluatorComment) {
        dataToUpdate.evaluatorComment = updateData.evaluatorComment
      }
    }
    
    // 2. ผู้ตรวจสอบ (REVIEWER)
    if (isReviewer && evaluation.status === 'REVIEWER_REVIEWING') {
      // ผู้ตรวจสอบสามารถอนุมัติหรือปฏิเสธการประเมินได้
      if (updateData.reviewerApproved !== undefined) {
        dataToUpdate.reviewerApproved = updateData.reviewerApproved
        
        if (updateData.reviewerApproved) {
          // ถ้าอนุมัติ ให้เปลี่ยนสถานะและส่งต่อไปยังผู้จัดการ
          dataToUpdate.status = 'MANAGER_REVIEWING'
          
          // ส่งอีเมลแจ้งเตือนไปยังผู้จัดการ
          const reviewUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/evaluations/${evaluation.id}`
          
          await sendReviewNotification(
            evaluation.manager.email,
            `${evaluation.manager.firstName} ${evaluation.manager.lastName}`,
            `${evaluation.evaluator.firstName} ${evaluation.evaluator.lastName}`,
            1, // จำนวนพนักงานที่ถูกประเมิน
            `${evaluation.period}/${evaluation.year}`,
            reviewUrl
          )
        } else {
          // ถ้าปฏิเสธ ให้เปลี่ยนสถานะกลับไปให้ผู้ประเมินแก้ไข
          dataToUpdate.status = 'REJECTED'
          
          // ตรวจสอบว่ามีเหตุผลในการปฏิเสธหรือไม่
          if (!updateData.reviewerRejectedReason) {
            return NextResponse.json(
              { message: 'กรุณาระบุเหตุผลในการปฏิเสธการประเมิน' },
              { status: 400 }
            )
          }
          
          dataToUpdate.reviewerRejectedReason = updateData.reviewerRejectedReason
          
          // ส่งอีเมลแจ้งเตือนไปยังผู้ประเมิน
          const evaluationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/evaluations/${evaluation.id}`
          
          await sendRejectedEvaluationNotification(
            evaluation.evaluator.email,
            `${evaluation.evaluator.firstName} ${evaluation.evaluator.lastName}`,
            `${evaluation.reviewer.firstName} ${evaluation.reviewer.lastName}`,
            updateData.reviewerRejectedReason,
            evaluationUrl
          )
        }
      }
      
      if (updateData.reviewerComment) {
        dataToUpdate.reviewerComment = updateData.reviewerComment
      }
    }
    
    // 3. ผู้จัดการ (MANAGER)
    if (isManager && evaluation.status === 'MANAGER_REVIEWING') {
      // ผู้จัดการสามารถอนุมัติหรือปฏิเสธการประเมินได้
      if (updateData.managerApproved !== undefined) {
        dataToUpdate.managerApproved = updateData.managerApproved
        
        if (updateData.managerApproved) {
          // ถ้าอนุมัติ ให้เปลี่ยนสถานะเป็นเสร็จสิ้น
          dataToUpdate.status = 'COMPLETED'
          
          // คำนวณคะแนนเฉลี่ยและเกรด
          const averageScore = calculateAverageScore(evaluation.answers)
          const grade = calculateGrade(averageScore)
          
          dataToUpdate.finalScore = averageScore
          dataToUpdate.finalGrade = grade
          
          // ส่งอีเมลแจ้งผลการประเมินให้พนักงาน
          const resultUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/evaluations/result/${evaluation.id}`
          
          await sendEvaluationResultNotification(
            evaluation.evaluee.email,
            `${evaluation.evaluee.firstName} ${evaluation.evaluee.lastName}`,
            `${evaluation.period}/${evaluation.year}`,
            averageScore,
            grade,
            resultUrl
          )
          
          // ส่งการแจ้งเตือนผ่าน Telegram ให้ Admin
          await notifyCompletedEvaluation(
            evaluation.id,
            evaluation.evaluee.department,
            1 // จำนวนพนักงานที่ถูกประเมิน
          )
        } else {
          // ถ้าปฏิเสธ ให้เปลี่ยนสถานะกลับไปให้ผู้ตรวจสอบพิจารณาใหม่
          dataToUpdate.status = 'REVIEWER_REVIEWING'
          
          // ตรวจสอบว่ามีเหตุผลในการปฏิเสธหรือไม่
          if (!updateData.managerRejectedReason) {
            return NextResponse.json(
              { message: 'กรุณาระบุเหตุผลในการปฏิเสธการประเมิน' },
              { status: 400 }
            )
          }
          
          dataToUpdate.managerRejectedReason = updateData.managerRejectedReason
          
          // ส่งอีเมลแจ้งเตือนไปยังผู้ตรวจสอบ
          const reviewUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/evaluations/${evaluation.id}`
          
          await sendRejectedEvaluationNotification(
            evaluation.reviewer.email,
            `${evaluation.reviewer.firstName} ${evaluation.reviewer.lastName}`,
            `${evaluation.manager.firstName} ${evaluation.manager.lastName}`,
            updateData.managerRejectedReason,
            reviewUrl
          )
        }
      }
      
      if (updateData.managerComment) {
        dataToUpdate.managerComment = updateData.managerComment
      }
    }
    
    // ตรวจสอบว่ามีข้อมูลที่จะอัพเดทหรือไม่
    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { message: 'ไม่มีข้อมูลที่ต้องการอัพเดท หรือไม่มีสิทธิ์ในการอัพเดทข้อมูล' },
        { status: 400 }
      )
    }
    
    // อัพเดทข้อมูลการประเมิน
    const updatedEvaluation = await prisma.evaluation.update({
      where: { id },
      data: dataToUpdate,
      include: {
        evaluee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          }
        },
        evaluator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
      },
    })
    
    return NextResponse.json({
      message: 'อัพเดทข้อมูลการประเมินสำเร็จ',
      evaluation: updatedEvaluation,
    })
  } catch (error: any) {
    console.error('Update evaluation error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลการประเมิน' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// ลบข้อมูลการประเมิน (เฉพาะ Admin และ Admin HR)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
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
    
    // ตรวจสอบสิทธิ์การลบการประเมิน (เฉพาะ Admin และ Admin HR)
    if (user.role !== 'ADMIN' && user.role !== 'ADMIN_HR') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์ในการลบข้อมูลการประเมิน' },
        { status: 403 }
      )
    }
    
    // ตรวจสอบว่ามีการประเมินนี้หรือไม่
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
    })
    
    if (!evaluation) {
      return NextResponse.json(
        { message: 'ไม่พบข้อมูลการประเมิน' },
        { status: 404 }
      )
    }
    
    // ลบคำตอบทั้งหมดของการประเมินนี้
    await prisma.answer.deleteMany({
      where: { evaluationId: id },
    })
    
    // ลบการประเมิน
    await prisma.evaluation.delete({
      where: { id },
    })
    
    return NextResponse.json({
      message: 'ลบข้อมูลการประเมินสำเร็จ',
    })
  } catch (error: any) {
    console.error('Delete evaluation error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการลบข้อมูลการประเมิน' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}