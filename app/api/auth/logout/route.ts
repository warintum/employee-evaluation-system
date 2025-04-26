import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // ดึง cookies instance
    const cookiesInstance = await cookies()
    // ลบ token cookie
    cookiesInstance.delete('token')
    
    return NextResponse.json({
      message: 'ออกจากระบบสำเร็จ'
    })
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการออกจากระบบ' },
      { status: 500 }
    )
  }
}