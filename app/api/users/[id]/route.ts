import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken, hashPassword } from '@/app/lib/utils'

const prisma = new PrismaClient()

// ดึงข้อมูลผู้ใช้ตาม ID
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
    
    // ตรวจสอบสิทธิ์การเข้าถึง (Admin, Admin HR, หรือเจ้าของข้อมูล)
    if (
      decodedToken.role !== 'ADMIN' &&
      decodedToken.role !== 'ADMIN_HR' &&
      decodedToken.id !== id
    ) {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์เข้าถึงข้อมูล' },
        { status: 403 }
      )
    }
    
    // ดึงข้อมูลผู้ใช้
    const user = await prisma.user.findUnique({
      where: { id },
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
        updatedAt: true,
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Get user error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// อัพเดทข้อมูลผู้ใช้
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
    
    // ตรวจสอบสิทธิ์การเข้าถึง (Admin, Admin HR, หรือเจ้าของข้อมูล)
    const isAdminUser = decodedToken.role === 'ADMIN' || decodedToken.role === 'ADMIN_HR'
    const isOwnProfile = decodedToken.id === id
    
    if (!isAdminUser && !isOwnProfile) {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์เข้าถึงข้อมูล' },
        { status: 403 }
      )
    }
    
    // ดึงข้อมูลจาก request body
    const updateData = await request.json()
    
    // ตรวจสอบว่าผู้ใช้งานมีอยู่จริงหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { message: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }
    
    // กำหนดข้อมูลที่อนุญาตให้อัพเดท
    const dataToUpdate: any = {}
    
    // สำหรับข้อมูลทั่วไปที่ผู้ใช้สามารถแก้ไขเองได้
    if (updateData.firstName) dataToUpdate.firstName = updateData.firstName
    if (updateData.lastName) dataToUpdate.lastName = updateData.lastName
    
    // สำหรับการเปลี่ยนรหัสผ่าน
    if (updateData.password) {
      dataToUpdate.password = await hashPassword(updateData.password)
    }
    
    // สำหรับข้อมูลที่เฉพาะ Admin/Admin HR สามารถแก้ไขได้
    if (isAdminUser) {
      if (updateData.email) dataToUpdate.email = updateData.email
      if (updateData.employeeId) dataToUpdate.employeeId = updateData.employeeId
      if (updateData.role) dataToUpdate.role = updateData.role
      if (updateData.position) dataToUpdate.position = updateData.position
      if (updateData.department) dataToUpdate.department = updateData.department
      if (updateData.isExempt !== undefined) dataToUpdate.isExempt = updateData.isExempt
      if (updateData.isActive !== undefined) dataToUpdate.isActive = updateData.isActive
    }
    
    // ตรวจสอบว่ามีข้อมูลที่จะอัพเดทหรือไม่
    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { message: 'ไม่มีข้อมูลที่ต้องการอัพเดท' },
        { status: 400 }
      )
    }
    
    // อัพเดทข้อมูลผู้ใช้
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
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
        updatedAt: true,
      },
    })
    
    return NextResponse.json({
      message: 'อัพเดทข้อมูลผู้ใช้สำเร็จ',
      user: updatedUser,
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลผู้ใช้' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// ลบข้อมูลผู้ใช้ (เฉพาะ Admin และ Admin HR)
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
    
    // ตรวจสอบสิทธิ์การเข้าถึง (เฉพาะ Admin และ Admin HR)
    if (decodedToken.role !== 'ADMIN' && decodedToken.role !== 'ADMIN_HR') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์เข้าถึงข้อมูล' },
        { status: 403 }
      )
    }
    
    // ตรวจสอบว่าผู้ใช้งานมีอยู่จริงหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { message: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }
    
    // ป้องกันการลบบัญชี Admin คนสุดท้าย
    if (existingUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN', isActive: true },
      })
      
      if (adminCount <= 1) {
        return NextResponse.json(
          { message: 'ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้' },
          { status: 400 }
        )
      }
    }
    
    // ลบข้อมูลผู้ใช้ (ในกรณีนี้เราจะไม่ลบจริงๆ แต่จะเปลี่ยนสถานะเป็นไม่ใช้งาน)
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })
    
    return NextResponse.json({
      message: 'ลบข้อมูลผู้ใช้สำเร็จ',
    })
  } catch (error: any) {
    console.error('Delete user error:', error)
    
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการลบข้อมูลผู้ใช้' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}