import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/app/lib/utils'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // ตรวจสอบ token และสิทธิ์การเข้าถึง
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
    
    // ดึงข้อมูลสำหรับ Dashboard
    
    // 1. จำนวนพนักงานทั้งหมด
    const totalEmployees = await prisma.user.count({
      where: { 
        isActive: true,
        role: 'USER'
      }
    })
    
    // 2. จำนวนการประเมินที่เสร็จสิ้น
    const completedEvaluations = await prisma.evaluation.count({
      where: { status: 'COMPLETED' }
    })
    
    // 3. จำนวนการประเมินที่กำลังดำเนินการ
    const pendingEvaluations = await prisma.evaluation.count({
      where: { 
        status: {
          not: 'COMPLETED'
        }
      }
    })
    
    // 4. คะแนนเฉลี่ย KPI จากการประเมินทั้งหมด
    const evaluationsWithScore = await prisma.evaluation.findMany({
      where: { 
        status: 'COMPLETED',
        finalScore: { not: null }
      },
      select: { finalScore: true }
    })
    
    const totalScores = evaluationsWithScore.reduce((sum, evaluation) => {
      return sum + (evaluation.finalScore || 0)
    }, 0)
    
    const averageScore = evaluationsWithScore.length > 0 
      ? parseFloat((totalScores / evaluationsWithScore.length).toFixed(1))
      : 0
    
    // 5. ความก้าวหน้าการประเมิน (จำนวนที่เสร็จสิ้น / จำนวนทั้งหมด * 100)
    const totalEvaluations = completedEvaluations + pendingEvaluations
    const progressPercentage = totalEvaluations > 0 
      ? Math.round((completedEvaluations / totalEvaluations) * 100)
      : 0
    
    // 6. ข้อมูลเพิ่มเติมตามความต้องการ
    
    return NextResponse.json({
      totalEmployees,
      completedEvaluations,
      pendingEvaluations,
      averageScore,
      progressPercentage,
      // ข้อมูลอื่นๆ ที่ต้องการ
    })
  } catch (error: any) {
    console.error('Dashboard data error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}