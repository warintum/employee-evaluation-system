'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  employeeId: string
  role: string
  position: string
  department: string
  isExempt: boolean
  isActive: boolean
}

type AuthContextType = {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  logout: () => void
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // ตรวจสอบสถานะการเข้าสู่ระบบเมื่อโหลดหน้า
  /*useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get('/api/auth/me')
        setUser(data.user)
      } catch (err) {
        // ถ้าไม่ได้เข้าสู่ระบบ ไม่ต้องแสดงข้อผิดพลาด
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])*/

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ลองดึงข้อมูลจาก API ก่อน
        const { data } = await axios.get('/api/auth/me')
        console.log("User data from API:", data.user)
        setUser(data.user)
      } catch (err) {
        console.log("Failed to get user from API, checking localStorage...")
        // ถ้าไม่สำเร็จ ลองดึงจาก localStorage
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser)
            console.log("User data from localStorage:", parsedUser)
            setUser(parsedUser)
          } catch (parseErr) {
            console.error("Error parsing user data from localStorage:", parseErr)
            setUser(null)
          }
        } else {
          console.log("No user data in localStorage")
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }
  
    checkAuth()
  }, [])

// เข้าสู่ระบบ
/*const login = async (email: string, password: string, remember: boolean = false) => {
  try {
    setLoading(true)
    setError(null)
    console.log("เริ่มทำการ login...")

    const { data } = await axios.post('/api/auth/login', {
      email,
      password,
      remember
    })

    console.log("Login สำเร็จ, ข้อมูลผู้ใช้:", data.user)
    
    // เก็บข้อมูลผู้ใช้
    setUser(data.user)
    
    console.log("กำลังทำการ redirect ตาม role:", data.user.role)
    
    // ทำ redirect ตาม role โดยใช้ window.location.href
    setTimeout(() => { // เพิ่ม setTimeout เพื่อให้แน่ใจว่า state ถูกอัปเดตก่อน redirect
      if (data.user.role === 'ADMIN' || data.user.role === 'ADMIN_HR') {
        console.log("Redirecting to /admin/dashboard via window.location")
       // window.location.href = '/admin/dashboard'
      } else if (data.user.role === 'MANAGER') {
        console.log("Redirecting to /dashboard via window.location") // เปลี่ยนเป็น /dashboard ชั่วคราวเนื่องจากยังไม่มีหน้า /manager
        window.location.href = '/dashboard'
      } else if (data.user.role === 'REVIEWER') {
        console.log("Redirecting to /dashboard via window.location") // เปลี่ยนเป็น /dashboard ชั่วคราวเนื่องจากยังไม่มีหน้า /reviewer
        window.location.href = '/dashboard'
      } else if (data.user.role === 'EVALUATOR') {
        console.log("Redirecting to /dashboard via window.location") // เปลี่ยนเป็น /dashboard ชั่วคราวเนื่องจากยังไม่มีหน้า /evaluator
        window.location.href = '/dashboard'
      } else {
        console.log("Redirecting to /dashboard via window.location")
        window.location.href = '/dashboard'
      }
    }, 300); // รอเล็กน้อยเพื่อให้แน่ใจว่า state ถูกอัปเดตและ console.log ทำงานเสร็จ
    
  } catch (err: any) {
    console.error('Login error:', err)
    setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
  } finally {
    setLoading(false)
  }
}*/

// เข้าสู่ระบบ
const login = async (email: string, password: string, remember: boolean = false) => {
  try {
    setLoading(true)
    setError(null)
    console.log("เริ่มทำการ login...")

    const { data } = await axios.post('/api/auth/login', {
      email,
      password,
      remember
    })

    console.log("Login สำเร็จ, ข้อมูลผู้ใช้:", data.user)
    setUser(data.user)
    
    // เก็บข้อมูลผู้ใช้ใน localStorage เพื่อทดสอบ
    localStorage.setItem('user', JSON.stringify(data.user))
    
    console.log("กำลังทำการ redirect ตาม role:", data.user.role)
    
    // ทำ redirect หลังจากรอสักครู่เพื่อให้ state และ localStorage ถูกอัปเดตก่อน
    setTimeout(() => {
      if (data.user.role === 'ADMIN' || data.user.role === 'ADMIN_HR') {
        console.log("Redirecting to /admin/dashboard")
        window.location.href = '/admin/dashboard'
      } else if (data.user.role === 'MANAGER') {
        console.log("Redirecting to /dashboard")
        window.location.href = '/dashboard'
      } else if (data.user.role === 'REVIEWER') {
        console.log("Redirecting to /dashboard")
        window.location.href = '/dashboard'
      } else if (data.user.role === 'EVALUATOR') {
        console.log("Redirecting to /dashboard")
        window.location.href = '/dashboard'
      } else {
        console.log("Redirecting to /dashboard")
        window.location.href = '/dashboard'
      }
    }, 500)
    
  } catch (err: any) {
    console.error('Login error:', err)
    setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
  } finally {
    setLoading(false)
  }
}
  // ออกจากระบบ
  const logout = async () => {
    try {
      setLoading(true)
      await axios.post('/api/auth/logout')
      setUser(null)
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoading(false)
    }
  }

  // รีเซ็ตรหัสผ่าน
  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      await axios.post('/api/auth/reset-password', { email })
    } catch (err: any) {
      console.error('Reset password error:', err)
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}