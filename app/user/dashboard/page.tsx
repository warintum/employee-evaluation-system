'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import AppLayout from '@/app/components/layout/AppLayout'
import { formatThaiDate, translateEvaluationStatus, getStatusColor } from '@/app/lib/utils'
import { Button } from '@/app/components/ui/Button'
import axios from 'axios'
import { useRouter } from 'next/navigation'

// ประเภทข้อมูล Dashboard
interface DashboardData {
  evaluationHistory: {
    month: string
    score: number
    period: string
    year: string
  }[]
  latestEvaluations: {
    id: string
    period: string
    year: string
    status: string
    score: number
    grade: string
    evaluator: string
    evaluatorPosition: string
    completedDate: string
  }[]
  pendingEvaluations: {
    id: string
    period: string
    year: string
    status: string
    dueDate: string
    evaluator: string
    evaluatorPosition: string
  }[]
  skillsRadarData: {
    category: string
    score: number
    fullMark: number
  }[]
  achievements: {
    id: string
    title: string
    date: string
    description: string
  }[]
  attendance: {
    present: number
    late: number
    absent: number
    leave: number
  }
}

// Dashboard Component
export default function UserDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // โหลดข้อมูลจาก API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/user/dashboard')
        setData(data)
        setError(null)
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error)
        setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล Dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  // ตรวจสอบข้อมูลเพื่อความปลอดภัย
  const safeData: DashboardData = data || {
    evaluationHistory: [],
    latestEvaluations: [],
    pendingEvaluations: [],
    skillsRadarData: [],
    achievements: [],
    attendance: { present: 0, late: 0, absent: 0, leave: 0 }
  }

  // สร้างข้อมูลสำหรับกราฟวงกลมการเข้างาน
  const attendanceData = [
    { name: 'เข้างาน', value: safeData.attendance.present, color: '#4ade80' },
    { name: 'มาสาย', value: safeData.attendance.late, color: '#facc15' },
    { name: 'ขาดงาน', value: safeData.attendance.absent, color: '#f87171' },
    { name: 'ลางาน', value: safeData.attendance.leave, color: '#60a5fa' },
  ]

  const getGradeColor = (grade: string) => {
    const colorMap: Record<string, string> = {
      'A': 'bg-green-100 text-green-800',
      'B+': 'bg-blue-100 text-blue-800',
      'B': 'bg-blue-100 text-blue-800',
      'C+': 'bg-yellow-100 text-yellow-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D+': 'bg-orange-100 text-orange-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800',
    }
    
    return colorMap[grade] || colorMap['default']
  }

  return (
    <AppLayout>
      {/* แสดงข้อมูล dashboard */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p className="font-medium">เกิดข้อผิดพลาด</p>
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* ส่วนแรก - ข้อมูลส่วนตัวและการประเมินล่าสุด */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* ข้อมูลส่วนตัว */}
            <div className="bg-white rounded-xl shadow-sm p-6 transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-indigo-500 rounded-full p-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-800">{user?.firstName} {user?.lastName}</h2>
                  <p className="text-sm text-gray-500">รหัสพนักงาน: {user?.employeeId}</p>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ตำแหน่ง</p>
                    <p className="text-sm font-medium">{user?.position}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">แผนก</p>
                    <p className="text-sm font-medium">{user?.department}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-600 mb-2">รอบประเมินปัจจุบัน</h3>
                <div className="flex justify-between">
                  <span className="text-sm">
                    {safeData.pendingEvaluations.length > 0 
                      ? `${safeData.pendingEvaluations[0].period}/${safeData.pendingEvaluations[0].year}`
                      : safeData.latestEvaluations.length > 0
                        ? `${safeData.latestEvaluations[0].period}/${safeData.latestEvaluations[0].year}`
                        : 'ไม่มีข้อมูล'
                    }
                  </span>
                  {safeData.pendingEvaluations.length > 0 ? (
                    <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">
                      อยู่ระหว่างการประเมิน
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      ไม่มีการประเมินที่รอดำเนินการ
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* กราฟคะแนนย้อนหลัง */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2 transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <h2 className="text-lg font-bold text-gray-800 mb-4">คะแนนประเมินย้อนหลัง</h2>
              {safeData.evaluationHistory.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={safeData.evaluationHistory}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg p-6 text-center">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <p className="text-gray-500">ยังไม่มีข้อมูลคะแนนประเมินย้อนหลัง</p>
                </div>
              )}
            </div>
          </div>
          
          {/* ส่วนที่สอง - การประเมินรอดำเนินการและการประเมินล่าสุด */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* การประเมินที่รอดำเนินการ */}
            <div className="bg-white rounded-xl shadow-sm p-6 transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">การประเมินรอดำเนินการ</h2>
                <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  {safeData.pendingEvaluations.length} รายการ
                </span>
              </div>
              
              {safeData.pendingEvaluations.length > 0 ? (
                <div className="space-y-4">
                  {safeData.pendingEvaluations.map((evaluation) => (
                    <div key={evaluation.id} className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-800">รอบ {evaluation.period}/{evaluation.year}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(evaluation.status)}`}>
                          {translateEvaluationStatus(evaluation.status)}
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-1">กำหนดส่ง: {formatThaiDate(new Date(evaluation.dueDate))}</p>
                        <p className="text-sm text-gray-600">ผู้ประเมิน: {evaluation.evaluator}</p>
                        <p className="text-xs text-gray-500">{evaluation.evaluatorPosition}</p>
                      </div>
                      
                      <div className="mt-4">
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={() => router.push(`/evaluations/self/${evaluation.id}`)}
                        >
                          ประเมินตนเอง
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                  <p className="text-gray-600">ไม่มีการประเมินที่รอดำเนินการ</p>
                </div>
              )}
            </div>
            
            {/* การประเมินล่าสุด */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2 transition duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden">
              <h2 className="text-lg font-bold text-gray-800 mb-4">ผลการประเมินล่าสุด</h2>
              
              {safeData.latestEvaluations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">รอบ</th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ประเมิน</th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คะแนน</th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เกรด</th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">วันที่เสร็จสิ้น</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {safeData.latestEvaluations.map((evaluation) => (
                        <tr key={evaluation.id} className="hover:bg-gray-50 transition duration-150">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{evaluation.period}/{evaluation.year}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{evaluation.evaluator}</div>
                              <div className="text-xs text-gray-500">{evaluation.evaluatorPosition}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900 mr-2">{evaluation.score}%</span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${evaluation.score}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeColor(evaluation.grade)}`}>
                              {evaluation.grade}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatThaiDate(new Date(evaluation.completedDate))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                  <p className="text-gray-600">ยังไม่มีผลการประเมิน</p>
                </div>
              )}
              
              {safeData.latestEvaluations.length > 0 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/evaluations/history')}
                  >
                    ดูผลการประเมินทั้งหมด
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* ส่วนที่สาม - ความก้าวหน้าและทักษะ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* ทักษะและความสามารถ */}
            <div className="bg-white rounded-xl shadow-sm p-6 transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <h2 className="text-lg font-bold text-gray-800 mb-4">ทักษะและความสามารถ</h2>
              
              {safeData.skillsRadarData.length > 0 ? (
                <div className="space-y-4">
                  {safeData.skillsRadarData.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{skill.category}</span>
                        <span className="text-sm font-medium text-gray-700">{skill.score}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(skill.score / skill.fullMark) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <p className="text-gray-600">ยังไม่มีข้อมูลทักษะการทำงาน</p>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/skills')}
                >
                  ดูรายละเอียดทักษะทั้งหมด
                </Button>
              </div>
            </div>
            
            {/* สถิติการเข้างาน */}
            <div className="bg-white rounded-xl shadow-sm p-6 transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <h2 className="text-lg font-bold text-gray-800 mb-4">สถิติการเข้างาน</h2>
              
              <div className="flex justify-center">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-700">เข้างาน: {safeData.attendance.present}%</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-700">มาสาย: {safeData.attendance.late}%</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-700">ขาดงาน: {safeData.attendance.absent}%</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-700">ลางาน: {safeData.attendance.leave}%</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/attendance/history')}
                >
                  ดูสถิติการเข้างานทั้งหมด
                </Button>
              </div>
            </div>
            
            {/* ความสำเร็จและรางวัล */}
            <div className="bg-white rounded-xl shadow-sm p-6 transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <h2 className="text-lg font-bold text-gray-800 mb-4">ความสำเร็จและรางวัล</h2>
              
              {safeData.achievements.length > 0 ? (
                <div className="space-y-4">
                  {safeData.achievements.map((achievement) => (
                    <div key={achievement.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-purple-500 rounded-full p-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">{achievement.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{formatThaiDate(new Date(achievement.date))}</p>
                          <p className="text-xs text-gray-600 mt-2">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                  </svg>
                  <p className="text-gray-600">ยังไม่มีรางวัลหรือความสำเร็จ</p>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/achievements')}
                >
                  ดูความสำเร็จทั้งหมด
                </Button>
              </div>
            </div>
          </div>
          
{/* ส่วนสุดท้าย - เป้าหมายและการพัฒนา */}
<div className="bg-white rounded-xl shadow-sm p-6 mb-6 transition duration-300 hover:-translate-y-1 hover:shadow-md">
  <h2 className="text-lg font-bold text-gray-800 mb-4">เป้าหมายการพัฒนา</h2>
  
  {safeData.latestEvaluations.length > 0 ? (
    <div className="bg-gray-50 p-5 rounded-lg">
      <div className="border-b pb-4 mb-4">
        <h3 className="text-md font-medium text-gray-700 mb-2">เป้าหมายสำหรับไตรมาสนี้</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm text-gray-600">พัฒนาทักษะการสื่อสารกับทีม</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm text-gray-600">เพิ่มประสิทธิภาพในการทำงานโดยใช้เทคโนโลยีใหม่</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm text-gray-600">พัฒนาทักษะการแก้ไขปัญหาเฉพาะหน้า</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-2">คำแนะนำจากผู้ประเมิน</h3>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 italic">
            "คุณมีการพัฒนาด้านการทำงานที่ดีขึ้นอย่างต่อเนื่อง แต่ควรพัฒนาด้านการสื่อสารกับทีมให้มากขึ้น
            และเริ่มเรียนรู้เครื่องมือใหม่ๆ เพื่อเพิ่มประสิทธิภาพในการทำงาน"
          </p>
          <div className="flex justify-end mt-2">
            <span className="text-xs text-gray-500">
              - {safeData.latestEvaluations[0].evaluator}, {safeData.latestEvaluations[0].evaluatorPosition} ({safeData.latestEvaluations[0].period}/{safeData.latestEvaluations[0].year})
            </span>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
      </svg>
      <p className="text-gray-600">ยังไม่มีข้อมูลเป้าหมายการพัฒนา</p>
    </div>
  )}
  
  <div className="mt-6 flex justify-center">
    <Button
      variant="default"
      onClick={() => router.push('/development-plan')}
    >
      จัดการแผนพัฒนาของฉัน
    </Button>
  </div>
</div>

{/* ส่วนแนะนำการอบรม */}
<div className="bg-white rounded-xl shadow-sm p-6 mb-6 transition duration-300 hover:-translate-y-1 hover:shadow-md">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-lg font-bold text-gray-800">คอร์สอบรมที่แนะนำสำหรับคุณ</h2>
    <a href="/trainings" className="text-sm text-blue-600 hover:text-blue-800">
      ดูทั้งหมด
    </a>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
      <div className="flex-shrink-0 bg-blue-500 rounded-full p-2 w-10 h-10 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">พัฒนาทักษะการสื่อสารในองค์กร</h3>
      <p className="text-xs text-gray-500 mb-3">วันที่: 10 มิ.ย. 2025 | ระยะเวลา: 2 วัน</p>
      <p className="text-xs text-gray-600">
        เรียนรู้เทคนิคการสื่อสารที่มีประสิทธิภาพในทีม การให้ข้อมูลย้อนกลับ และการสื่อสารกับลูกค้า
      </p>
      <div className="mt-3">
        <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
          ลงทะเบียน
        </button>
      </div>
    </div>
    
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
      <div className="flex-shrink-0 bg-green-500 rounded-full p-2 w-10 h-10 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">การวิเคราะห์ข้อมูลสำหรับการตลาดดิจิทัล</h3>
      <p className="text-xs text-gray-500 mb-3">วันที่: 22 มิ.ย. 2025 | ระยะเวลา: 3 วัน</p>
      <p className="text-xs text-gray-600">
        เรียนรู้การใช้เครื่องมือวิเคราะห์ข้อมูลเพื่อเพิ่มประสิทธิภาพในการทำการตลาดดิจิทัล
      </p>
      <div className="mt-3">
        <button className="text-xs font-medium text-green-600 hover:text-green-800">
          ลงทะเบียน
        </button>
      </div>
    </div>
    
    <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-lg p-4 border border-purple-100">
      <div className="flex-shrink-0 bg-purple-500 rounded-full p-2 w-10 h-10 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">เทคนิคการแก้ไขปัญหาและการตัดสินใจ</h3>
      <p className="text-xs text-gray-500 mb-3">วันที่: 5 ก.ค. 2025 | ระยะเวลา: 1 วัน</p>
      <p className="text-xs text-gray-600">
        พัฒนาทักษะการคิดวิเคราะห์ การแก้ไขปัญหาเฉพาะหน้า และการตัดสินใจอย่างมีประสิทธิภาพ
      </p>
      <div className="mt-3">
        <button className="text-xs font-medium text-purple-600 hover:text-purple-800">
          ลงทะเบียน
        </button>
      </div>
    </div>
  </div>
</div>