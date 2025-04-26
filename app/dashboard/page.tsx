'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@/app/hooks/useAuth'
import { motion } from 'framer-motion'
import AppLayout from '@/app/components/layout/AppLayout'
import { 
  AttendanceSummaryCard, 
  CurrentEvaluationCard, 
  LastEvaluationCard 
} from '@/app/components/dashboard/UserDashboardCards'

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("เริ่มดึงข้อมูล dashboard...")
        setLoading(true)
        setError(null)
        
        const { data } = await axios.get('/api/dashboard/user')
        console.log("ได้รับข้อมูล dashboard:", data)
        
        setDashboardData(data)
      } catch (err: any) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล dashboard:", err)
        setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  // สร้างคอมโพเนนต์แสดงสถานะ loading
  const renderLoading = () => (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  )

  // สร้างคอมโพเนนต์แสดงข้อผิดพลาด
  const renderError = () => (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center bg-red-50 p-8 rounded-lg max-w-lg">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="text-lg font-medium text-red-800 mb-2">เกิดข้อผิดพลาด</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition duration-300"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  )

  // สร้างคอมโพเนนต์แสดงคำแนะนำเมื่อไม่มีข้อมูล
  const renderEmptyState = () => (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีข้อมูล</h2>
      <p className="text-gray-600 mb-6">ยังไม่มีข้อมูลการประเมินในระบบ</p>
      <p className="text-gray-500 text-sm">การประเมินจะถูกจัดทำโดยผู้บังคับบัญชาของคุณ เมื่อถึงรอบการประเมิน</p>
    </div>
  )

  // แสดงผลหน้า Dashboard
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">สวัสดี คุณ{user?.firstName || 'ผู้ใช้งาน'}</h1>
        <p className="text-gray-600">ข้อมูลสรุปผลการประเมินและการลางานของคุณ</p>
      </div>

      {loading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : !dashboardData ? (
        renderEmptyState()
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* แสดงข้อมูลการขาด ลา มาสาย */}
          <AttendanceSummaryCard attendance={dashboardData.attendance} />
          
          {/* แสดงข้อมูลการประเมินรอบปัจจุบัน */}
          <CurrentEvaluationCard evaluation={dashboardData.currentEvaluation} />
          
          {/* แสดงข้อมูลผลการประเมินล่าสุด */}
          <LastEvaluationCard evaluation={dashboardData.lastCompletedEvaluation} />
          
          {/* ส่วนล่าง: ข้อมูลเพิ่มเติม */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">ข้อมูลการประเมินเพิ่มเติม</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 className="text-md font-medium text-gray-800">คำแนะนำการประเมิน</h3>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  การประเมินจะถูกดำเนินการตามรอบการประเมินที่กำหนดโดยฝ่ายบุคคล 
                  ซึ่งคุณสามารถเข้าไปดูรายละเอียดการประเมินและทำการประเมินตนเองได้
                  เมื่อได้รับอนุญาตจากระบบ
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 className="text-md font-medium text-gray-800">เป้าหมายการพัฒนา</h3>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  จากผลการประเมินล่าสุด คุณควรมุ่งเน้นการพัฒนาทักษะและความสามารถ
                  ตามคำแนะนำจากผู้ประเมิน เพื่อเพิ่มประสิทธิภาพในการทำงานและโอกาสในการเติบโตในสายงาน
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AppLayout>
  )
}