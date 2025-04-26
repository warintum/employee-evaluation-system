'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { motion } from 'framer-motion'
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import AppLayout from '@/app/components/layout/AppLayout'
import { formatThaiDate, translateEvaluationStatus } from '@/app/lib/utils'
import { Button } from '@/app/components/ui/Button'
import axios from 'axios'

// ข้อมูลตัวอย่างสำหรับแสดงในหน้า Dashboard
const sampleChartData = [
  { month: 'พ.ย.', score: 65 },
  { month: 'ธ.ค.', score: 72 },
  { month: 'ม.ค.', score: 83 },
  { month: 'ก.พ.', score: 79 },
  { month: 'มี.ค.', score: 86 },
  { month: 'เม.ย.', score: 94 },
]

const sampleDepartmentProgress = [
  { department: 'ฝ่ายการตลาด', progress: 92 },
  { department: 'ฝ่ายบุคคล', progress: 85 },
  { department: 'ฝ่ายไอที', progress: 78 },
  { department: 'ฝ่ายขาย', progress: 64 },
  { department: 'ฝ่ายผลิต', progress: 45 },
]

const sampleTopEmployees = [
  {
    id: '1',
    name: 'สุนิสา วงศ์เสรี',
    email: 'sunisa@example.com',
    position: 'ผู้จัดการฝ่ายการตลาด',
    department: 'การตลาด',
    score: 96.5,
  },
  {
    id: '2',
    name: 'พิชัย ธนบดี',
    email: 'pichai@example.com',
    position: 'นักพัฒนาซอฟต์แวร์',
    department: 'ไอที',
    score: 94.2,
  },
  {
    id: '3',
    name: 'นภาพร สุขสมบูรณ์',
    email: 'napaporn@example.com',
    position: 'พนักงานฝ่ายขาย',
    department: 'ฝ่ายขาย',
    score: 92.7,
  },
  {
    id: '4',
    name: 'วิชัย มานะงาน',
    email: 'wichai@example.com',
    position: 'ผู้จัดการฝ่ายบุคคล',
    department: 'บุคคล',
    score: 90.3,
  },
  {
    id: '5',
    name: 'อรุณี สว่างใจ',
    email: 'arunee@example.com',
    position: 'หัวหน้าควบคุมคุณภาพ',
    department: 'ผลิต',
    score: 89.5,
  },
]

const sampleUpcomingReviews = [
  {
    id: '1',
    title: 'การประเมินประจำไตรมาส',
    date: '2025-04-30',
    department: 'ฝ่ายการตลาด',
  },
  {
    id: '2',
    title: 'การประเมินพนักงานใหม่',
    date: '2025-05-02',
    department: 'ฝ่ายไอที',
  },
  {
    id: '3',
    title: 'การประเมิน KPI รายเดือน',
    date: '2025-05-05',
    department: 'ฝ่ายผลิต',
  },
  {
    id: '4',
    title: 'ประเมินทักษะพนักงาน',
    date: '2025-05-08',
    department: 'ฝ่ายบุคคล',
  },
]

// Dashboard Component
export default function Dashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 152,
    completedEvaluations: 62,
    pendingEvaluations: 24,
    averageScore: 78.5,
    progressPercentage: 78,
  })
  const [loading, setLoading] = useState(true)

  // สำหรับแอปพลิเคชันจริง ให้โหลดข้อมูลจาก API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // สำหรับตัวอย่าง เรียกใช้ข้อมูลตัวอย่าง
        // ในแอปพลิเคชันจริง ให้เรียกใช้ API
        // const { data } = await axios.get('/api/dashboard')
        // setDashboardData(data)
        
        // จำลองการโหลดข้อมูล
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // สร้างข้อมูลสำหรับกราฟวงกลม
  const pieData = [
    { name: 'เสร็จสิ้น', value: dashboardData.completedEvaluations, fill: '#3b82f6' },
    { name: 'รอดำเนินการ', value: dashboardData.pendingEvaluations, fill: '#f59e0b' },
  ]

  const getDepartmentColor = (department: string) => {
    const colorMap: Record<string, string> = {
      'ฝ่ายการตลาด': 'bg-green-500',
      'ฝ่ายบุคคล': 'bg-blue-500',
      'ฝ่ายไอที': 'bg-blue-500',
      'ฝ่ายขาย': 'bg-yellow-500',
      'ฝ่ายผลิต': 'bg-orange-500',
      'default': 'bg-gray-500',
    }
    
    return colorMap[department] || colorMap['default']
  }

  const getDepartmentBadgeColor = (department: string) => {
    const colorMap: Record<string, string> = {
      'การตลาด': 'bg-green-100 text-green-800',
      'บุคคล': 'bg-purple-100 text-purple-800',
      'ไอที': 'bg-blue-100 text-blue-800',
      'ฝ่ายขาย': 'bg-yellow-100 text-yellow-800',
      'ผลิต': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800',
    }
    
    return colorMap[department] || colorMap['default']
  }

  return (
    <AppLayout>
      {/* แสดงข้อมูล dashboard */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 fade-in">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="font-semibold text-gray-500 text-sm">พนักงานทั้งหมด</h2>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-800">{dashboardData.totalEmployees}</p>
                    <span className="text-xs font-medium text-green-500 bg-green-100 px-2 py-1 rounded ml-2 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                      +12.5%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="font-semibold text-gray-500 text-sm">รอบประเมินเสร็จสิ้น</h2>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-800">{dashboardData.completedEvaluations}</p>
                    <span className="text-xs font-medium text-purple-500 bg-purple-100 px-2 py-1 rounded ml-2 flex items-center">
                      ล่าสุด {formatThaiDate(new Date())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="font-semibold text-gray-500 text-sm">กำลังดำเนินการ</h2>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-800">{dashboardData.pendingEvaluations}</p>
                    <span className="text-xs font-medium text-yellow-500 bg-yellow-100 px-2 py-1 rounded ml-2 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      รอ 6 วัน
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="font-semibold text-gray-500 text-sm">คะแนนเฉลี่ย KPI</h2>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-800">{dashboardData.averageScore}%</p>
                    <span className="text-xs font-medium text-green-500 bg-green-100 px-2 py-1 rounded ml-2 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                      +5.2%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mid Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Main Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2 fade-in" style={{animationDelay: "0.1s"}}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">ภาพรวมคะแนนประเมิน</h2>
                  <p className="text-sm text-gray-500">ข้อมูลการประเมินย้อนหลัง 6 เดือน</p>
                </div>
                
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200">
                    รายเดือน
                  </button>
                  <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">
                    รายไตรมาส
                  </button>
                  <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">
                    รายปี
                  </button>
                </div>
              </div>
              
              {/* Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={sampleChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
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
              
              <div className="flex justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">คะแนนประเมินรวม</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  อัพเดทล่าสุด: {formatThaiDate(new Date())}
                </div>
              </div>
            </div>
            
            {/* Performance Status */}
            <div className="bg-white rounded-xl shadow-sm p-6 fade-in" style={{animationDelay: "0.2s"}}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">ความก้าวหน้าการประเมิน</h2>
                  <p className="text-sm text-gray-500">รอบเดือนเมษายน 2568</p>
                </div>
                
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  ดูเพิ่มเติม
                </button>
              </div>
              
              {/* Circular Progress */}
              <div className="flex flex-col items-center mt-4 mb-6">
                <div 
                  className="relative h-32 w-32 rounded-full"
                  style={{
                    background: `conic-gradient(#3B82F6 0% ${dashboardData.progressPercentage}%, #E5E7EB ${dashboardData.progressPercentage}% 100%)`
                  }}
                >
                  <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center">
                    <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-gray-800">{dashboardData.progressPercentage}%</span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600">ดำเนินการแล้ว 118 คน</p>
              </div>
              
              {/* Department Progress */}
              <div className="space-y-4 mt-8">
                {sampleDepartmentProgress.map((dept, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">{dept.department}</span>
                      <span className="text-xs font-medium text-gray-700">{dept.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${getDepartmentColor(dept.department)} h-2 rounded-full`} 
                        style={{ width: `${dept.progress}%` }} 
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performers */}
            <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2 fade-in" style={{animationDelay: "0.3s"}}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">พนักงานดีเด่นประจำเดือน</h2>
                  <p className="text-sm text-gray-500">อัพเดทล่าสุด: {formatThaiDate(new Date())}</p>
                </div>
                
                <div>
                  <select className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option>แสดงทั้งหมด</option>
                    <option>ฝ่ายการตลาด</option>
                    <option>ฝ่ายบุคคล</option>
                    <option>ฝ่ายไอที</option>
                    <option>ฝ่ายขาย</option>
                    <option>ฝ่ายผลิต</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">พนักงาน</th>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ตำแหน่ง</th>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ฝ่าย</th>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คะแนน</th>
                      <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sampleTopEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {employee.name.split(' ').map(part => part.charAt(0)).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                              <div className="text-xs text-gray-500">{employee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.position}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDepartmentBadgeColor(employee.department)}`}>
                            {employee.department}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-2">{employee.score}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${employee.score}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-2">รายละเอียด</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Upcoming Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-6 fade-in" style={{animationDelay: "0.4s"}}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">การประเมินที่กำลังมา</h2>
                  <p className="text-sm text-gray-500">รอการประเมิน 7 วันข้างหน้า</p>
                </div>
                
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  ดูทั้งหมด
                </button>
              </div>
              
              <div className="space-y-4">
                {sampleUpcomingReviews.map((review) => (
                  <div 
                    key={review.id}
                    className="flex p-4 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition duration-300"
                  >
                    <span className="flex-shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-md bg-blue-100 text-blue-600">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </span>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{review.title}</h3>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {formatThaiDate(new Date(review.date))}
                      </div>
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getDepartmentBadgeColor(review.department)}`}>
                          {review.department}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button variant="outline" className="w-full flex justify-center items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  เพิ่มการประเมินใหม่
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  )
}
