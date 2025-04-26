import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import bcrypt from 'bcryptjs'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
// โดยปกติควรใช้วิธีนี้แต่ในกรณีที่เกิดปัญหา type ให้ลองใช้วิธีด้านล่าง
// import * as jwt from 'jsonwebtoken'
// ทางเลือกในการ import ที่อาจช่วยแก้ปัญหา TypeScript errors
const jwt = require('jsonwebtoken')

// รวม Tailwind classes จากหลายแหล่ง
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper functions สำหรับการเข้ารหัสรหัสผ่าน
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Helper functions สำหรับ JWT
/*export function generateToken(payload: any): string {
  const secret = process.env.JWT_SECRET || 'default-secret-key'
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d'
  
  // ใช้ require จะช่วยหลีกเลี่ยงปัญหา TypeScript
  return jwt.sign(payload, secret, { expiresIn })
}

export function verifyToken(token: string): any {
  try {
    const secret = process.env.JWT_SECRET || 'default-secret-key'
    console.log("Verifying token with secret prefix:", secret.substring(0, 3) + "...")
    const decoded = jwt.verify(token, secret)
    console.log("Token verification successful")
    return decoded
  } catch (error: any) {
    console.error("Token verification failed:", error.message)
    return null
  }
}*/

// utils.ts (ส่วน jwt)

// ใช้ jsonwebtoken ในส่วน server components และ API routes
export function generateToken(payload: any): string {
  const secret = process.env.JWT_SECRET || 'default-secret-key'
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d'
  
  // ใช้ require จะช่วยหลีกเลี่ยงปัญหา TypeScript
  const jwt = require('jsonwebtoken')
  return jwt.sign(payload, secret, { expiresIn })
}

// ฟังก์ชัน verifyToken สำหรับใช้ใน server components และ API routes
export function verifyToken(token: string): any {
  try {
    const secret = process.env.JWT_SECRET || 'default-secret-key'
    const jwt = require('jsonwebtoken')
    return jwt.verify(token, secret)
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

// Helper function สำหรับฟอร์แมตวันที่เป็นภาษาไทย
export function formatThaiDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  
  // ใช้ date-fns กับ locale th สำหรับแสดงเดือนภาษาไทย
  // แปลงเป็นปี พ.ศ. โดยบวกด้วย 543
  const thaiYear = date.getFullYear() + 543
  
  // รูปแบบ: 31 มกราคม 2566
  const formattedDate = format(date, 'd MMMM', { locale: th })
  
  return `${formattedDate} ${thaiYear}`
}

// Helper function สำหรับการแปลงตัวเลขเป็นเกรด
export function calculateGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C+'
  if (score >= 50) return 'C'
  if (score >= 40) return 'D+'
  if (score >= 30) return 'D'
  return 'F'
}

// Helper function สำหรับคำนวณคะแนนเฉลี่ยจากคำตอบทั้งหมด
export function calculateAverageScore(answers: Array<{ score: number }>): number {
  if (answers.length === 0) return 0
  
  const sum = answers.reduce((acc, answer) => acc + answer.score, 0)
  return parseFloat((sum / answers.length).toFixed(2))
}

// Helper function สำหรับแปลง Role เป็นข้อความภาษาไทย
export function translateRole(role: string): string {
  const roleMap: Record<string, string> = {
    'ADMIN': 'ผู้ดูแลระบบ',
    'ADMIN_HR': 'HR',
    'USER': 'พนักงาน',
    'EVALUATOR': 'ผู้ประเมิน',
    'REVIEWER': 'ผู้ตรวจสอบ',
    'MANAGER': 'ผู้จัดการ/ผู้อำนวยการ'
  }
  
  return roleMap[role] || role
}

// Helper function สำหรับแปลง AttendanceType เป็นข้อความภาษาไทย
export function translateAttendanceType(type: string): string {
  const typeMap: Record<string, string> = {
    'LATE': 'มาสาย',
    'ABSENT': 'ขาดงาน',
    'SICK_LEAVE': 'ลาป่วย',
    'PERSONAL_LEAVE': 'ลากิจ',
    'VACATION': 'พักร้อน',
    'OTHER': 'อื่นๆ'
  }
  
  return typeMap[type] || type
}

// Helper function สำหรับแปลง EvaluationStatus เป็นข้อความภาษาไทย
export function translateEvaluationStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'รอดำเนินการ',
    'SELF_EVALUATING': 'รอการประเมินตนเอง',
    'EVALUATOR_EVALUATING': 'รอผู้ประเมิน',
    'REVIEWER_REVIEWING': 'รอผู้ตรวจสอบ',
    'MANAGER_REVIEWING': 'รอผู้จัดการ',
    'COMPLETED': 'เสร็จสิ้น',
    'REJECTED': 'ถูกปฏิเสธ'
  }
  
  return statusMap[status] || status
}

// แปลงสถานะการประเมินเป็นสีสำหรับ UI
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'PENDING': 'bg-gray-200 text-gray-800',
    'SELF_EVALUATING': 'bg-blue-100 text-blue-800',
    'EVALUATOR_EVALUATING': 'bg-yellow-100 text-yellow-800',
    'REVIEWER_REVIEWING': 'bg-purple-100 text-purple-800',
    'MANAGER_REVIEWING': 'bg-indigo-100 text-indigo-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800'
  }
  
  return colorMap[status] || 'bg-gray-200 text-gray-800'
}