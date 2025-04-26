'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { motion } from 'framer-motion'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import AppLayout from '@/app/components/layout/AppLayout'
import axios from 'axios'
import { useRouter } from 'next/navigation'

type SettingCategory = 'general' | 'notifications' | 'evaluations' | 'security' | 'telegram'

interface SettingItem {
  id: string
  key: string
  value: string
  description?: string
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'toggle'
  options?: { value: string, label: string }[]
  category: SettingCategory
}

export default function SettingsPage() {
  const { user, loading: userLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SettingCategory>('general')
  const [settings, setSettings] = useState<SettingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  // โหลดข้อมูลการตั้งค่า
  useEffect(() => {
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงหน้านี้หรือไม่
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/settings')
        
        // แปลงข้อมูลและจัดหมวดหมู่
        const transformedSettings: SettingItem[] = data.settings.map((item: any) => {
          const setting: SettingItem = {
            id: item.id,
            key: item.key,
            value: item.value,
            description: item.description || '',
            // กำหนด type และ category ตาม key
            type: getSettingType(item.key),
            category: getSettingCategory(item.key)
          }
          
          // เพิ่ม options ถ้าเป็น select
          if (setting.type === 'select') {
            setting.options = getSettingOptions(item.key)
          }
          
          return setting
        })
        
        setSettings(transformedSettings)
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user && user.role === 'ADMIN') {
      fetchSettings()
    }
  }, [user, router])

  // Helper function เพื่อกำหนด type ของการตั้งค่า
  const getSettingType = (key: string): 'text' | 'number' | 'email' | 'password' | 'select' | 'toggle' => {
    if (key.includes('EMAIL') && key.includes('HOST')) return 'text'
    if (key.includes('EMAIL') && key.includes('PORT')) return 'number'
    if (key.includes('EMAIL') && key.includes('USER')) return 'email'
    if (key.includes('EMAIL') && key.includes('PASS')) return 'password'
    if (key.includes('TOKEN')) return 'password'
    if (key.includes('ENABLE') || key.includes('ALLOW')) return 'select'
    if (key.includes('DAYS') || key.includes('COUNT')) return 'number'
    if (key.includes('PERIOD') || key.includes('YEAR') || key.includes('GRADE') || key.includes('LANGUAGE')) return 'select'
    return 'text'
  }

  // Helper function เพื่อกำหนดหมวดหมู่
  const getSettingCategory = (key: string): SettingCategory => {
    if (key.includes('EMAIL') || key.includes('NOTIFICATION')) return 'notifications'
    if (key.includes('TELEGRAM')) return 'telegram'
    if (key.includes('JWT') || key.includes('PASSWORD') || key.includes('LOGIN')) return 'security'
    if (key.includes('EVALUATION') || key.includes('PERIOD') || key.includes('GRADE')) return 'evaluations'
    return 'general'
  }

  // Helper function เพื่อกำหนด options สำหรับ select
  const getSettingOptions = (key: string): { value: string, label: string }[] => {
    if (key.includes('ENABLE') || key.includes('ALLOW')) {
      return [
        { value: 'true', label: 'เปิดใช้งาน' },
        { value: 'false', label: 'ปิดใช้งาน' }
      ]
    }
    
    if (key.includes('LANGUAGE')) {
      return [
        { value: 'th', label: 'ไทย' },
        { value: 'en', label: 'อังกฤษ' }
      ]
    }
    
    if (key.includes('PERIOD') && key.includes('DEFAULT')) {
      return [
        { value: 'MONTHLY', label: 'รายเดือน' },
        { value: 'QUARTERLY', label: 'รายไตรมาส' },
        { value: 'SEMI_ANNUAL', label: 'ทุก 6 เดือน' },
        { value: 'ANNUAL', label: 'รายปี' }
      ]
    }
    
    if (key.includes('FISCAL_YEAR_START')) {
      return [
        { value: '1', label: 'มกราคม' },
        { value: '4', label: 'เมษายน' },
        { value: '10', label: 'ตุลาคม' }
      ]
    }
    
    // Default options
    return [
      { value: 'true', label: 'เปิดใช้งาน' },
      { value: 'false', label: 'ปิดใช้งาน' }
    ]
  }

  // การจัดการเมื่อมีการเปลี่ยนแปลงค่า setting
  const handleSettingChange = (id: string, value: string) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, value } : setting
      )
    )
  }

  // การบันทึกการตั้งค่า
  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveError('')
      
      // แปลงข้อมูลให้เหมาะสมสำหรับส่งไป API
      const dataToSave = settings.map(setting => ({
        id: setting.id,
        key: setting.key,
        value: setting.value
      }))
      
      await axios.post('/api/settings', { settings: dataToSave })
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error: any) {
      console.error('Failed to save settings:', error)
      setSaveError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า')
    } finally {
      setIsSaving(false)
    }
  }

  // การส่งข้อความทดสอบ Telegram
  const handleTestTelegram = async () => {
    try {
      setIsSaving(true)
      
      const { data } = await axios.post('/api/settings/test-telegram')
      
      alert(data.message || 'ส่งข้อความทดสอบผ่าน Telegram สำเร็จ!')
    } catch (error: any) {
      console.error('Failed to test Telegram:', error)
      alert(`เกิดข้อผิดพลาด: ${error.response?.data?.message || error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // การส่งอีเมลทดสอบ
  const handleTestEmail = async () => {
    try {
      setIsSaving(true)
      
      const { data } = await axios.post('/api/settings/test-email', { email: user?.email })
      
      alert(data.message || 'ส่งอีเมลทดสอบสำเร็จ!')
    } catch (error: any) {
      console.error('Failed to test email:', error)
      alert(`เกิดข้อผิดพลาด: ${error.response?.data?.message || error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // ตรวจสอบว่ากำลังโหลดข้อมูลหรือไม่
  if (userLoading || loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        </div>
      </AppLayout>
    )
  }

  // ตรวจสอบว่าผู้ใช้เป็น Admin หรือไม่
  if (!user || user.role !== 'ADMIN') {
    return (
      <AppLayout>
        <div className="text-center text-red-500 py-10">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าระบบ</h1>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSave}
                isLoading={isSaving}
              >
                บันทึกการเปลี่ยนแปลง
              </Button>
            </div>
          </div>
          
          {saveSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6"
            >
              บันทึกการตั้งค่าสำเร็จ
            </motion.div>
          )}
          
          {saveError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6"
            >
              {saveError}
            </motion.div>
          )}
          
          <div className="flex flex-col md:flex-row">
            {/* แท็บด้านซ้าย */}
            <div className="w-full md:w-64 mb-6 md:mb-0 md:mr-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-1">
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'general' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => setActiveTab('general')}
                  >
                    <div className="flex items-center">
                      <svg className={`h-5 w-5 mr-2 ${activeTab === 'general' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      ทั่วไป
                    </div>
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'notifications' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <div className="flex items-center">
                      <svg className={`h-5 w-5 mr-2 ${activeTab === 'notifications' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      การแจ้งเตือนอีเมล
                    </div>
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'telegram' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => setActiveTab('telegram')}
                  >
                    <div className="flex items-center">
                      <svg className={`h-5 w-5 mr-2 ${activeTab === 'telegram' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Telegram
                    </div>
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'evaluations' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => setActiveTab('evaluations')}
                  >
                    <div className="flex items-center">
                      <svg className={`h-5 w-5 mr-2 ${activeTab === 'evaluations' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      การประเมิน
                    </div>
                  </button>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'security' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => setActiveTab('security')}
                  >
                    <div className="flex items-center">
                      <svg className={`h-5 w-5 mr-2 ${activeTab === 'security' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      ความปลอดภัย
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* เนื้อหาด้านขวา */}
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">
                  {activeTab === 'general' && 'การตั้งค่าทั่วไป'}
                  {activeTab === 'notifications' && 'การตั้งค่าอีเมล'}
                  {activeTab === 'telegram' && 'การตั้งค่า Telegram'}
                  {activeTab === 'evaluations' && 'การตั้งค่าการประเมิน'}
                  {activeTab === 'security' && 'การตั้งค่าความปลอดภัย'}
                </h2>
                
                <div className="space-y-6">
                  {settings
                    .filter(setting => setting.category === activeTab)
                    .map(setting => (
                      <div key={setting.id} className="bg-white p-4 rounded-md shadow-sm">
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {setting.key}
                          </label>
                          <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                        </div>
                        
                        {setting.type === 'select' ? (
                          <select
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={setting.value}
                            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                          >
                            {setting.options?.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type={setting.type}
                            value={setting.value}
                            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  
                  {/* ปุ่มทดสอบสำหรับ Telegram */}
                  {activeTab === 'telegram' && (
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        onClick={handleTestTelegram}
                        isLoading={isSaving}
                      >
                        ทดสอบการส่งข้อความ Telegram
                      </Button>
                    </div>
                  )}
                  
                  {/* ปุ่มทดสอบสำหรับอีเมล */}
                  {activeTab === 'notifications' && (
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        onClick={handleTestEmail}
                        isLoading={isSaving}
                      >
                        ทดสอบการส่งอีเมล
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}