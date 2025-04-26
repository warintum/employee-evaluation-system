import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from './hooks/useAuth'

// นำเข้า Google Font - Prompt
const googleFont = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HR Evalify - ระบบประเมินพนักงานออนไลน์',
  description: 'ระบบประเมินพนักงานออนไลน์ที่ออกแบบมาเพื่อทำให้การประเมินพนักงานเป็นเรื่องง่ายขึ้น',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        {/* Font Prompt จาก Google Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* ใช้ CDN สำหรับ Tailwind และ Framer Motion */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/framer-motion/10.16.4/framer-motion.js"></script>
        
        {/* ตั้งค่า Tailwind สำหรับ shadcn/ui */}
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              darkMode: "class",
              theme: {
                extend: {
                  colors: {
                    border: "hsl(var(--border))",
                    input: "hsl(var(--input))",
                    ring: "hsl(var(--ring))",
                    background: "hsl(var(--background))",
                    foreground: "hsl(var(--foreground))",
                    primary: {
                      DEFAULT: "hsl(var(--primary))",
                      foreground: "hsl(var(--primary-foreground))",
                    },
                    secondary: {
                      DEFAULT: "hsl(var(--secondary))",
                      foreground: "hsl(var(--secondary-foreground))",
                    },
                    destructive: {
                      DEFAULT: "hsl(var(--destructive))",
                      foreground: "hsl(var(--destructive-foreground))",
                    },
                    muted: {
                      DEFAULT: "hsl(var(--muted))",
                      foreground: "hsl(var(--muted-foreground))",
                    },
                    accent: {
                      DEFAULT: "hsl(var(--accent))",
                      foreground: "hsl(var(--accent-foreground))",
                    },
                    popover: {
                      DEFAULT: "hsl(var(--popover))",
                      foreground: "hsl(var(--popover-foreground))",
                    },
                    card: {
                      DEFAULT: "hsl(var(--card))",
                      foreground: "hsl(var(--card-foreground))",
                    },
                  },
                  fontFamily: {
                    prompt: ["Prompt", "sans-serif"],
                  },
                },
              },
            }
          `
        }} />
      </head>
      <body className={googleFont.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}