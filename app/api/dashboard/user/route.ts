import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient, AttendanceType } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('เริ่มการดึงข้อมูล dashboard ของผู้ใช้')
    
    // ดึง token จาก cookies
    const cookiesInstance = await cookies()
    const token = cookiesInstance.get('token')?.value
    
    if (!token) {
      console.log('ไม่พบ token - ไม่ได้เข้าสู่ระบบ')
      return NextResponse.json(
        { message: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      )
    }
    
    // ตรวจสอบ token
    const decodedToken = verifyToken(token)
    
    if (!decodedToken || !decodedToken.id) {
      console.log('Token ไม่ถูกต้องหรือหมดอายุ')
      // ถ้า token ไม่ถูกต้องหรือหมดอายุ ให้ลบ cookie
      cookiesInstance.delete('token')
      
      return NextResponse.json(
        { message: 'Token ไม่ถูกต้องหรือหมดอายุ' },
        { status: 401 }
      )
    }
    
    // ดึงข้อมูลผู้ใช้จาก id ใน token
    const userId = decodedToken.id
    console.log(`ดึงข้อมูลสำหรับผู้ใช้ ID: ${userId}`)
    
    // ดึงข้อมูลปีปัจจุบัน
    const currentYear = new Date().getFullYear()
    console.log(`ปีปัจจุบัน: ${currentYear}`)
    
    // 1. ดึงข้อมูลการขาด ลา มาสาย ในปีปัจจุบัน
    const startOfYear = new Date(currentYear, 0, 1) // 1 มกราคม ปีปัจจุบัน
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59) // 31 ธันวาคม ปีปัจจุบัน
    
    console.log(`ช่วงเวลาที่ดึงข้อมูล: ${startOfYear.toISOString()} ถึง ${endOfYear.toISOString()}`)
    
    const attendances = await prisma.attendance.findMany({
      where: {
        userId: userId,
        date: {
          gte: startOfYear,
          lte: endOfYear
        }
      }
    })
    
    console.log(`พบข้อมูลการลางาน/ขาดงาน/มาสาย ${attendances.length} รายการ`)
    
    // จัดกลุ่มข้อมูลการขาด ลา มาสาย
    const attendanceSummary = {
      ABSENT: 0,      // ขาดงาน
      LATE: 0,        // มาสาย
      SICK_LEAVE: 0,  // ลาป่วย
      PERSONAL_LEAVE: 0, // ลากิจ
      VACATION: 0,    // พักร้อน
      OTHER: 0        // อื่นๆ
    }
    
    attendances.forEach(attendance => {
      // @ts-ignore - เรารู้ว่า attendance.type เป็นค่าที่มีอยู่ใน attendanceSummary
      attendanceSummary[attendance.type]++
    })
    
    console.log('สรุปข้อมูลการลางาน:', attendanceSummary)
    
    // 2. ดึงข้อมูลการประเมินรอบปัจจุบัน (ถ้ามี)
    const currentEvaluation = await prisma.evaluation.findFirst({
      where: {
        evalueeId: userId,
        year: currentYear,
        status: {
          not: 'COMPLETED' // ยังไม่เสร็จสิ้น
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        evaluator: {
          select: {
            firstName: true,
            lastName: true,
            position: true
          }
        },
        reviewer: {
          select: {
            firstName: true,
            lastName: true,
            position: true
          }
        },
        manager: {
          select: {
            firstName: true,
            lastName: true,
            position: true
          }
        }
      }
    })
    
    console.log('การประเมินรอบปัจจุบัน:', currentEvaluation ? 'พบข้อมูล' : 'ไม่พบข้อมูล')
    
    // 3. ดึงข้อมูลการประเมินล่าสุดที่เสร็จสิ้นแล้ว
    const lastCompletedEvaluation = await prisma.evaluation.findFirst({
      where: {
        evalueeId: userId,
        status: 'COMPLETED' // เสร็จสิ้นแล้ว
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        answers: {
          include: {
            question: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })
    
    console.log('การประเมินล่าสุดที่เสร็จสิ้น:', lastCompletedEvaluation ? 'พบข้อมูล' : 'ไม่พบข้อมูล')
    
    // ดึงข้อมูลการประเมินตนเอง (ถ้ามี)
    const selfEvaluation = await prisma.selfEvaluation.findFirst({
      where: {
        userId: userId,
        year: currentYear
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        selfAnswers: {
          include: {
            question: true
          }
        }
      }
    })
    
    console.log('การประเมินตนเอง:', selfEvaluation ? 'พบข้อมูล' : 'ไม่พบข้อมูล')
    
    // ส่งข้อมูลกลับไป
    return NextResponse.json({
      attendance: {
        summary: attendanceSummary,
        details: attendances
      },
      currentEvaluation,
      lastCompletedEvaluation,
      selfEvaluation
    })
    
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูล dashboard:', error)
    
    return NextResponse.json(
      { message: `เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}