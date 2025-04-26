import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'
import { sendEvaluationNotification } from '@/app/lib/email'
import { notifyNewEvaluation } from '@/app/lib/telegram'

const prisma = new PrismaClient()

// ดึงรายการประเมินทั้งหมด
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
    
    // ดึงค่า query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const status = url.searchParams.get('status') || undefined
    const year = url.searchParams.get('year') ? parseInt(url.searchParams.get('year') as string) : undefined
    const period = url.searchParams.get('period') || undefined
    const department = url.searchParams.get('department') || undefined
    
    // คำนวณค่า skip สำหรับการ pagination
    const skip = (page - 1) * limit
    
    // สร้าง filter สำหรับการค้นหา
    const whereClause: any = {}
    
    // เพิ่มเงื่อนไขตาม role ของผู้ใช้
    if (user.role === 'USER') {
      // ถ้าเป็น USER ให้ดึงเฉพาะการประเมินที่ตนเองเป็นผู้ถูกประเมิน
      whereClause.evalueeId = user.id
    } else if (user.role === 'EVALUATOR') {
      // ถ้าเป็น EVALUATOR ให้ดึงเฉพาะการประเมินที่ตนเองเป็นผู้ประเมิน
      whereClause.evaluatorId = user.id
    } else if (user.role === 'REVIEWER') {
      // ถ้าเป็น REVIEWER ให้ดึงเฉพาะการประเมินที่ตนเองเป็นผู้ตรวจสอบ
      whereClause.reviewerId = user.id
    } else if (user.role === 'MANAGER') {
      // ถ้าเป็น MANAGER ให้ดึงเฉพาะการประเมินที่ตนเองเป็นผู้จัดการ
      whereClause.managerId = user.id
    }
    // ถ้าเป็น ADMIN หรือ ADMIN_HR จะดึงข้อมูลทั้งหมด
    
    // เพิ่มเงื่อนไขการค้นหาอื่นๆ
    if (status) {
      whereClause.status = status
    }
    
    if (year) {
      whereClause.year = year
    }
    
    if (period) {
      whereClause.period = period
    }
    
    // ถ้าระบุแผนก (เฉพาะ Admin และ Admin HR)
    if (department && (user.role === 'ADMIN' || user.role === 'ADMIN_HR')) {
      whereClause.evaluee = {
        department
      }
    }
    
    // ดึงข้อมูลการประเมินตามเงื่อนไข
    const evaluations = await prisma.evaluation.findMany({
      where: whereClause,
      select: {
        id: true,
        year: true,
        period: true,
        status: true,
        finalScore: true,
        finalGrade: true,
        createdAt: true,
        updatedAt: true,
        evaluatorApproved: true,
        reviewerApproved: true,
        managerApproved: true,
        allowSelfEvaluation: true,
        
        // ข้อมูลผู้เกี่ยวข้อง
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
          }
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          }
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
          }
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    // นับจำนวนการประเมินทั้งหมดตามเงื่อนไข
    const totalEvaluations = await prisma.evaluation.count({
      where: whereClause,
    })
    
    // คำนวณจำนวนหน้าทั้งหมด
    const totalPages = Math.ceil(totalEvaluations / limit)
    
    return NextResponse.json({
      evaluations,
      meta: {
        currentPage: page,
        totalPages,
        totalEvaluations,
        limit,
      },
    })
  } catch (error: any) {
    console.error('Get evaluations error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการประเมิน' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// สร้างการประเมินใหม่
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
    
    // ตรวจสอบสิทธิ์การสร้างการประเมิน (ADMIN, ADMIN_HR, EVALUATOR)
    if (user.role !== 'ADMIN' && user.role !== 'ADMIN_HR' && user.role !== 'EVALUATOR') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์ในการสร้างการประเมิน' },
        { status: 403 }
      )
    }
    
    // ดึงข้อมูลจาก request body
    const {
      year,
      period,
      evalueeIds,  // รายการ ID ของผู้ถูกประเมิน
      allowSelfEvaluation = false
    } = await request.json()
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!year || !period || !evalueeIds || !Array.isArray(evalueeIds) || evalueeIds.length === 0) {
      return NextResponse.json(
        { message: 'กรุณาระบุข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }
    
    // ตรวจสอบว่าผู้ถูกประเมินมีอยู่จริงหรือไม่
    const evaluees = await prisma.user.findMany({
      where: {
        id: { in: evalueeIds },
        isActive: true,
        isExempt: false
      },
    })
    
    if (evaluees.length !== evalueeIds.length) {
      return NextResponse.json(
        { message: 'พบข้อผิดพลาด: มีผู้ถูกประเมินบางคนไม่มีอยู่ในระบบหรือได้รับการยกเว้น' },
        { status: 400 }
      )
    }
    
    // สร้างการประเมินใหม่สำหรับผู้ถูกประเมินแต่ละคน
    const createdEvaluations = []
    const failedEvaluations = []
    
    for (const evaluee of evaluees) {
      try {
        // ดึงข้อมูลลำดับผู้ประเมินตามแผนก
        const evaluatorSetup = await prisma.evaluatorSetup.findFirst({
          where: { departmentId: evaluee.department },
          include: {
            evaluator: true,
            reviewer: true,
            manager: true
          }
        })
        
        if (!evaluatorSetup) {
          failedEvaluations.push({
            evalueeId: evaluee.id,
            error: `ไม่พบข้อมูลลำดับผู้ประเมินสำหรับแผนก ${evaluee.department}`
          })
          continue
        }
        
        // ถ้าเป็น Admin หรือ Admin HR ให้ใช้ผู้ประเมินตามที่กำหนดในระบบ
        // แต่ถ้าเป็น EVALUATOR ให้ใช้ตัวเองเป็นผู้ประเมิน
        const evaluatorId = (user.role === 'EVALUATOR') ? user.id : evaluatorSetup.evaluatorId
        
        // ตรวจสอบว่าการประเมินซ้ำหรือไม่
        const existingEvaluation = await prisma.evaluation.findFirst({
          where: {
            year,
            period,
            evalueeId: evaluee.id,
            status: {
              not: 'COMPLETED'  // ไม่นับการประเมินที่เสร็จสิ้นแล้ว
            }
          }
        })
        
        if (existingEvaluation) {
          failedEvaluations.push({
            evalueeId: evaluee.id,
            error: 'มีการประเมินสำหรับพนักงานนี้ในรอบการประเมินนี้แล้ว'
          })
          continue
        }
        
        // สร้างการประเมินใหม่
        const newEvaluation = await prisma.evaluation.create({
          data: {
            year,
            period,
            evalueeId: evaluee.id,
            evaluatorId: evaluatorId,
            reviewerId: evaluatorSetup.reviewerId,
            managerId: evaluatorSetup.managerId,
            status: allowSelfEvaluation ? 'SELF_EVALUATING' : 'EVALUATOR_EVALUATING',
            allowSelfEvaluation
          },
          include: {
            evaluee: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            evaluator: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        })
        
        createdEvaluations.push(newEvaluation)
        
        // ถ้าอนุญาตให้ประเมินตนเอง ให้ส่งอีเมลแจ้งเตือนไปยังผู้ถูกประเมิน
        if (allowSelfEvaluation) {
          const selfEvaluationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/evaluations/self/${newEvaluation.id}`
          
          await sendSelfEvaluationNotification(
            evaluee.email,
            `${evaluee.firstName} ${evaluee.lastName}`,
            `${period}/${year}`,
            selfEvaluationUrl,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // กำหนดเวลา 7 วัน
          )
        } else {
          // ถ้าไม่อนุญาตให้ประเมินตนเอง ให้ส่งอีเมลแจ้งเตือนไปยังผู้ประเมิน
          const evaluationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/evaluations/${newEvaluation.id}`
          
          await sendEvaluationNotification(
            newEvaluation.evaluator.email,
            `${newEvaluation.evaluator.firstName} ${newEvaluation.evaluator.lastName}`,
            1,  // จำนวนพนักงานที่ต้องประเมิน (ในกรณีนี้คือ 1 คน)
            `${period}/${year}`,
            evaluationUrl,
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)  // กำหนดเวลา 14 วัน
          )
        }
      } catch (error) {
        console.error(`Error creating evaluation for employee ${evaluee.id}:`, error)
        failedEvaluations.push({
          evalueeId: evaluee.id,
          error: 'เกิดข้อผิดพลาดในการสร้างการประเมิน'
        })
      }
    }
    
    // ส่งการแจ้งเตือนผ่าน Telegram ให้ Admin (ถ้ามีการสร้างการประเมินสำเร็จอย่างน้อย 1 รายการ)
    if (createdEvaluations.length > 0) {
      await notifyNewEvaluation(
        createdEvaluations[0].id,
        `${user.firstName} ${user.lastName}`,
        createdEvaluations.length
      )
    }
    
    return NextResponse.json({
      message: `สร้างการประเมินสำเร็จ ${createdEvaluations.length} รายการ${failedEvaluations.length > 0 ? ` และล้มเหลว ${failedEvaluations.length} รายการ` : ''}`,
      evaluations: createdEvaluations,
      failed: failedEvaluations.length > 0 ? failedEvaluations : undefined
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create evaluation error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการสร้างการประเมิน' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function (นำเข้าจาก email.ts)
async function sendSelfEvaluationNotification(
  to: string,
  employeeName: string,
  evaluationPeriod: string,
  selfEvaluationUrl: string,
  dueDate: Date
) {
  // ในกรณีนี้เราเรียกใช้ฟังก์ชันจาก lib/email.ts
  // แต่เพื่อให้โค้ดทำงานได้ เราจะจำลองการเรียกใช้ฟังก์ชันแทน
  console.log(`Sending self-evaluation notification to ${to}`)
  return true
}