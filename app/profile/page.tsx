'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { motion } from 'framer-motion'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import AppLayout from '@/app/components/layout/AppLayout'
import axios from 'axios'
import { translateRole } from '@/app/lib/utils'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [updateError, setUpdateError] = useState('')

  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      }))
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
    
    // ลบข้อผิดพลาดเมื่อมีการแก้ไข
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    // ตรวจสอบข้อมูลทั่วไป
    if (!formData.firstName.trim()) {
      errors.firstName = 'กรุณากรอกชื่อ'
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'กรุณากรอกนามสกุล'
    }
    
    // ตรวจสอบรหัสผ่าน (ถ้ามีการกรอก)
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      // ต้องกรอกรหัสผ่านปัจจุบัน
      if (!formData.currentPassword) {
        errors.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบัน'
      }
      
      // ตรวจสอบรหัสผ่านใหม่
      if (!formData.newPassword) {
        errors.newPassword = 'กรุณากรอกรหัสผ่านใหม่'
      } else if (formData.newPassword.length < 6) {
        errors.newPassword = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
      }
      
      // ตรวจสอบการยืนยันรหัสผ่าน
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'กรุณายืนยันรหัสผ่านใหม่'
      } else if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateSuccess(false)
    setUpdateError('')
    
    if (!validateForm()) {
      return
    }
    
    try {
      setUpdateLoading(true)
      
      // สร้างข้อมูลที่จะส่งไปอัพเดท
      const updateData: Record<string, any> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      }
      
      // เพิ่มรหัสผ่านถ้ามีการกรอก
      if (formData.newPassword) {
        updateData.password = formData.newPassword
      }
      
      // ส่งข้อมูลไปอัพเดท
      await axios.patch(`/api/users/${user?.id}`, updateData)
      
      setUpdateSuccess(true)
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
      
      // รีเซ็ตข้อความสำเร็จหลังจาก 3 วินาที
      setTimeout(() => {
        setUpdateSuccess(false)
      }, 3000)
    } catch (error: any) {
      console.error('Update profile error:', error)
      setUpdateError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล')
    } finally {
      setUpdateLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center text-red-500 py-10">
          ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่อีกครั้ง
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">ข้อมูลส่วนตัว</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-sm text-gray-500 mb-1">ชื่อ-นามสกุล</h2>
              <p className="text-lg font-medium">{user.firstName} {user.lastName}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-sm text-gray-500 mb-1">อีเมล</h2>
              <p className="text-lg font-medium">{user.email}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-sm text-gray-500 mb-1">รหัสพนักงาน</h2>
              <p className="text-lg font-medium">{user.employeeId}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-sm text-gray-500 mb-1">ตำแหน่ง</h2>
              <p className="text-lg font-medium">{user.position}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-sm text-gray-500 mb-1">แผนก</h2>
              <p className="text-lg font-medium">{user.department}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-sm text-gray-500 mb-1">สิทธิในระบบ</h2>
              <p className="text-lg font-medium">{translateRole(user.role)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">แก้ไขข้อมูลส่วนตัว</h1>
          
          {updateSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6"
            >
              อัพเดทข้อมูลสำเร็จ
            </motion.div>
          )}
          
          {updateError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6"
            >
              {updateError}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">ข้อมูลทั่วไป</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="ชื่อ"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={formErrors.firstName}
                />
                
                <Input
                  label="นามสกุล"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={formErrors.lastName}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">เปลี่ยนรหัสผ่าน</h2>
              <div className="space-y-4">
                <Input
                  label="รหัสผ่านปัจจุบัน"
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  error={formErrors.currentPassword}
                />
                
                <Input
                  label="รหัสผ่านใหม่"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={formErrors.newPassword}
                />
                
                <Input
                  label="ยืนยันรหัสผ่านใหม่"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={formErrors.confirmPassword}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={updateLoading}
              >
                บันทึกการเปลี่ยนแปลง
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}