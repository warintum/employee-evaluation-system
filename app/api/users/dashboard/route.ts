import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'

const prisma = new PrismaClient()

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
    
    // ดึงข้อมูลการประเมินของผู้ใช้นี้ที่เสร็จสิ้นแล้ว (สำหรับแสดงประวัติคะแนน)
    const completedEvaluations = await prisma.evaluation.findMany({
      where: {
        evalueeId: user.id,
        status: 'COMPLETED',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 6, // ดึงข้อมูล 6 รอบล่าสุด
      include: {
        evaluator: {
          select: {
            firstName: true,
            lastName: true,
            position: true,
          }
        }
      }
    })
    
    // แปลงข้อมูลสำหรับกราฟประวัติคะแนน
    const evaluationHistory = completedEvaluations.map((evaluation) => {
      // สร้างชื่อเดือนจากวันที่เสร็จสิ้น
      const date = new Date(evaluation.updatedAt)
      const month = new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(date)
      
      return {
        month: `${month} ${date.getFullYear() + 543}`,
        score: evaluation.finalScore || 0,
        period: evaluation.period,
        year: evaluation.year,
      }
    }).reverse() // กลับลำดับให้เรียงจากเก่าไปใหม่
    
    // ดึงข้อมูลการประเมินล่าสุดที่เสร็จสิ้นแล้ว
    const latestEvaluations = completedEvaluations.map((evaluation) => {
      return {
        id: evaluation.id,
        period: evaluation.period,
        year: evaluation.year.toString(),
        status: evaluation.status,
        score: evaluation.finalScore || 0,
        grade: evaluation.finalGrade || '',
        evaluator: `${evaluation.evaluator.firstName} ${evaluation.evaluator.lastName}`,
        evaluatorPosition: evaluation.evaluator.position,
        completedDate: evaluation.updatedAt.toISOString().split('T')[0],
      }
    })
    
    // ดึงข้อมูลการประเมินที่รอดำเนินการ
    const pendingEvaluations = await prisma.evaluation.findMany({
      where: {
        evalueeId: user.id,
        status: {
          in: ['PENDING', 'SELF_EVALUATING']
        },
        allowSelfEvaluation: true, // เฉพาะการประเมินที่อนุญาตให้ประเมินตนเอง
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        evaluator: {
          select: {
            firstName: true,
            lastName: true,
            position: true,
          }
        }
      }
    })
    
    // แปลงข้อมูลการประเมินที่รอดำเนินการ
    const pendingEvaluationsData = pendingEvaluations.map((evaluation) => {
      // สร้างวันที่กำหนดส่ง (สมมติว่าต้องส่งภายใน 7 วันหลังจากสร้าง)
      const createdDate = new Date(evaluation.createdAt)
      const dueDate = new Date(createdDate)
      dueDate.setDate(dueDate.getDate() + 7)
      
      return {
        id: evaluation.id,
        period: evaluation.period,
        year: evaluation.year.toString(),
        status: evaluation.status,
        dueDate: dueDate.toISOString().split('T')[0],
        evaluator: `${evaluation.evaluator.firstName} ${evaluation.evaluator.lastName}`,
        evaluatorPosition: evaluation.evaluator.position,
      }
    })
    
    // ดึงข้อมูลคำตอบล่าสุดเพื่อวิเคราะห์ทักษะ
    let skillsRadarData = []
    
    if (completedEvaluations.length > 0) {
      // ใช้การประเมินล่าสุด
      const latestEvaluation = completedEvaluations[0]
      
      // ดึงคำตอบทั้งหมดพร้อมหมวดหมู่
      const answers = await prisma.answer.findMany({
        where: {
          evaluationId: latestEvaluation.id,
        },
        include: {
          question: {
            include: {
              category: true,
            }
          }
        }
      })
      
      // จัดกลุ่มคำตอบตามหมวดหมู่และคำนวณคะแนนเฉลี่ย
      const categoryScores = new Map()
      
      answers.forEach(answer => {
        const categoryName = answer.question.category.name
        
        if (!categoryScores.has(categoryName)) {
          categoryScores.set(categoryName, {
            totalScore: 0,
            count: 0
          })
        }
        
        const category = categoryScores.get(categoryName)
        category.totalScore += answer.score
        category.count += 1
      })
      
      // แปลงเป็นข้อมูลสำหรับกราฟ
      skillsRadarData = Array.from(categoryScores.entries()).map(([name, data]) => {
        return {
          category: name,
          score: parseFloat((data.totalScore / data.count).toFixed(1)),
          fullMark: 5
        }
      })
    } else {
      // ถ้าไม่มีข้อมูลการประเมิน ให้ใช้ข้อมูลตัวอย่าง
      skillsRadarData = [
        { category: 'ทักษะการทำงาน', score: 0, fullMark: 5 },
        { category: 'การสื่อสาร', score: 0, fullMark: 5 },
        { category: 'ความรับผิดชอบ', score: 0, fullMark: 5 },
        { category: 'การทำงานเป็นทีม', score: 0, fullMark: 5 },
      ]
    }
    
    // ดึงข้อมูลการขาด/ลา/มาสายในปีปัจจุบัน
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)
    const endOfYear = new Date(currentYear, 11, 31)
    
    const attendanceData = await prisma.attendance.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfYear,
          lte: endOfYear,
        }
      }
    })
    
    // คำนวณสถิติการเข้างาน
    const workingDays = 250 // สมมติว่าวันทำงานต่อปีประมาณ 250 วัน
    const daysPassed = Math.min(
      Math.floor((new Date().getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)),
      workingDays
    )
    
    const lateCount = attendanceData.filter(a => a.type === 'LATE').length
    const absentCount = attendanceData.filter(a => a.type === 'ABSENT').length
    const leaveCount = attendanceData.filter(a => 
      a.type === 'SICK_LEAVE' || 
      a.type === 'PERSONAL_LEAVE' || 
      a.type === 'VACATION' || 
      a.type === 'OTHER'
    ).length
    
    const attendance = {
      present: Math.round(((daysPassed - lateCount - absentCount - leaveCount) / daysPassed) * 100) || 0,
      late: Math.round((lateCount / daysPassed) * 100) || 0,
      absent: Math.round((absentCount / daysPassed) * 100) || 0,
      leave: Math.round((leaveCount / daysPassed) * 100) || 0,
    }
    
    // สร้างข้อมูลความสำเร็จและรางวัล (ตัวอย่าง - ในระบบจริงควรมีตาราง achievements)
    const achievements = [
      {
        id: '1',
        title: 'พนักงานดีเด่นประจำเดือน',
        date: '2025-03-01',
        description: 'คุณได้รับการคัดเลือกเป็นพนักงานดีเด่นประจำเดือนมีนาคม 2568'
      },
      {
        id: '2',
        title: 'เข้ารับการอบรม',
        date: '2025-02-15',
        description: 'คุณได้เข้าร่วมการอบรมหลักสูตร "การพัฒนาทักษะการสื่อสารในองค์กร"'
      }
    ]
    
    // รวมข้อมูลทั้งหมดและส่งกลับ
    return NextResponse.json({
      evaluationHistory,
      latestEvaluations,
      pendingEvaluations: pendingEvaluationsData,
      skillsRadarData,
      achievements,
      attendance,
    })
  } catch (error: any) {
    console.error('User dashboard error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}