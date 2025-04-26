'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { useAuth } from '@/app/hooks/useAuth'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
  const { resetPassword, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await resetPassword(email)
      setSubmitted(true)
    } catch (err) {
      // จัดการข้อผิดพลาดใน useAuth hook แล้ว
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-prompt">
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">รีเซ็ตรหัสผ่าน</h2>
            <p className="text-sm text-gray-600 mt-1">กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่</p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm"
            >
              {error}
            </motion.div>
          )}
          
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6"
            >
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">คำขอรีเซ็ตรหัสผ่านถูกส่งแล้ว</h3>
              <p className="mt-2 text-sm text-gray-500">
                เราได้ส่งอีเมลพร้อมลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่ {email} แล้ว กรุณาตรวจสอบอีเมลของคุณและทำตามคำแนะนำ
              </p>
              <div className="mt-6">
                <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  กลับไปยังหน้าเข้าสู่ระบบ
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="อีเมล"
                type="email"
                placeholder="กรอกอีเมลของคุณ"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />
              
              <div>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={loading}
                >
                  ส่งลิงก์รีเซ็ตรหัสผ่าน
                </Button>
              </div>
              
              <div className="text-center mt-4">
                <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
                  กลับไปยังหน้าเข้าสู่ระบบ
                </Link>
              </div>
            </form>
          )}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">© {new Date().getFullYear()} HR Evalify</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="hidden lg:block lg:flex-1 bg-gradient-to-br from-blue-600 to-indigo-800">
        <div className="h-full flex items-center justify-center p-12">
          <div className="max-w-lg text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white"
            >
              <h1 className="text-4xl font-bold mb-6">รีเซ็ตรหัสผ่านของคุณ</h1>
              <p className="text-xl mb-6">ไม่ต้องกังวล เราช่วยคุณได้ กรอกอีเมลเพื่อเริ่มขั้นตอนการรีเซ็ตรหัสผ่าน</p>
              <div className="bg-white bg-opacity-10 p-5 rounded-lg mt-8">
                <p className="text-white text-opacity-90">
                  หากคุณมีข้อสงสัยหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อผู้ดูแลระบบหรือฝ่ายบุคคลของคุณ
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}