'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { useAuth } from '@/app/hooks/useAuth'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password, rememberMe)
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">HR Evalify</h2>
            <p className="text-sm text-gray-600 mt-1">ระบบประเมินพนักงานออนไลน์</p>
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
            
            <Input
              label="รหัสผ่าน"
              type="password"
              placeholder="กรอกรหัสผ่านของคุณ"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  จดจำฉัน
                </label>
              </div>
              
              <Link href="/reset-password" className="text-sm text-blue-600 hover:text-blue-800">
                ลืมรหัสผ่าน?
              </Link>
            </div>
            
            <div>
              <Button
                type="submit"
                className="w-full"
                isLoading={loading}
              >
                เข้าสู่ระบบ
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">© {new Date().getFullYear()} MIS x HR</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="hidden lg:block lg:flex-1 bg-gradient-to-br from-blue-600 to-indigo-800 relative">
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-lg text-center"
          >
            <h1 className="text-4xl font-bold mb-6">ระบบประเมินพนักงานออนไลน์</h1>
            <p className="text-xl mb-8">
              ประเมินพนักงานอย่างมีประสิทธิภาพด้วยเครื่องมือที่ทันสมัย เรียกดูรายงานและติดตามผลการทำงานได้ทุกที่ทุกเวลา
            </p>
            
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="bg-white bg-opacity-10 p-5 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 bg-opacity-30 mx-auto mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">การประเมินที่ยืดหยุ่น</h3>
                <p className="text-sm text-white text-opacity-80">ตั้งค่าหมวดหมู่คำถามและลำดับการประเมินตามความต้องการ</p>
              </div>
              
              <div className="bg-white bg-opacity-10 p-5 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 bg-opacity-30 mx-auto mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">แจ้งเตือนอัตโนมัติ</h3>
                <p className="text-sm text-white text-opacity-80">ระบบแจ้งเตือนผ่าน Email และ Telegram เพื่อไม่พลาดทุกการประเมิน</p>
              </div>
              
              <div className="bg-white bg-opacity-10 p-5 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 bg-opacity-30 mx-auto mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">รายงานและสถิติ</h3>
                <p className="text-sm text-white text-opacity-80">ดูผลการประเมินในรูปแบบกราฟและรายงานที่สามารถ Export ได้</p>
              </div>
              
              <div className="bg-white bg-opacity-10 p-5 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 bg-opacity-30 mx-auto mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">ความปลอดภัยสูง</h3>
                <p className="text-sm text-white text-opacity-80">รักษาความปลอดภัยข้อมูลด้วย JWT Authentication และการเข้ารหัส</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}