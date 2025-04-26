import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken, hashPassword } from '@/app/lib/utils'

const prisma = new PrismaClient()

// ดึงรายชื่อผู้ใช้ทั้งหมด
export async function GET(request: Request) {
  try {
    // ตรวจสอบสิทธิ์การเข้าถึง (เฉพาะ Admin และ Admin HR)
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
    
    // ตรวจสอบสิทธิ์การเข้าถึง
    if (decodedToken.role !== 'ADMIN' && decodedToken.role !== 'ADMIN_HR') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์เข้าถึงข้อมูล' },
        { status: 403 }
      )
    }
    
    // ดึงค่า query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const department = url.searchParams.get('department') || ''
    
    // คำนวณค่า skip สำหรับการ pagination
    const skip = (page - 1) * limit
    
    // สร้าง filter สำหรับการค้นหา
    const whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (department) {
      whereClause.department = department
    }
    
    // ดึงข้อมูลผู้ใช้ทั้งหมดตามเงื่อนไข
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        role: true,
        position: true,
        department: true,
        isExempt: true,
        isActive: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    // นับจำนวนผู้ใช้ทั้งหมดตามเงื่อนไข
    const totalUsers = await prisma.user.count({
      where: whereClause,
    })
    
    // คำนวณจำนวนหน้าทั้งหมด
    const totalPages = Math.ceil(totalUsers / limit)
    
    return NextResponse.json({
      users,
      meta: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
      },
    })
  } catch (error: any) {
    console.error('Get users error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// สร้างผู้ใช้ใหม่
export async function POST(request: Request) {
  try {
    // ตรวจสอบสิทธิ์การเข้าถึง (เฉพาะ Admin และ Admin HR)
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
    
    // ตรวจสอบสิทธิ์การเข้าถึง
    if (decodedToken.role !== 'ADMIN' && decodedToken.role !== 'ADMIN_HR') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์เข้าถึงข้อมูล' },
        { status: 403 }
      )
    }
    
    // ดึงข้อมูลจาก request body
    const {
      email,
      password,
      firstName,
      lastName,
      employeeId,
      role,
      position,
      department,
      isExempt,
    } = await request.json()
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!email || !password || !firstName || !lastName || !employeeId || !role || !position || !department) {
      return NextResponse.json(
        { message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }
    
    // ตรวจสอบว่าอีเมลนี้มีอยู่แล้วหรือไม่
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    })
    
    if (existingUserByEmail) {
      return NextResponse.json(
        { message: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }
    
    // ตรวจสอบว่ารหัสพนักงานนี้มีอยู่แล้วหรือไม่
    const existingUserByEmployeeId = await prisma.user.findUnique({
      where: { employeeId },
    })
    
    if (existingUserByEmployeeId) {
      return NextResponse.json(
        { message: 'รหัสพนักงานนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }
    
    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await hashPassword(password)
    
    // สร้างผู้ใช้ใหม่
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        employeeId,
        role,
        position,
        department,
        isExempt: isExempt || false,
      },
    })
    
    // ไม่ส่งรหัสผ่านกลับไป
    const { password: _, ...userWithoutPassword } = newUser
    
    return NextResponse.json({
      message: 'สร้างผู้ใช้สำเร็จ',
      user: userWithoutPassword,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create user error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}