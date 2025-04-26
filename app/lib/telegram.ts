import TelegramBot from 'node-telegram-bot-api'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ฟังก์ชันสำหรับส่งการแจ้งเตือนไปยัง Telegram
export async function sendTelegramNotification(message: string): Promise<boolean> {
  try {
    // ดึงค่า Token และ Chat ID จากฐานข้อมูล (หรือใช้จาก env ก็ได้)
    const telegramTokenSetting = await prisma.setting.findUnique({
      where: { key: 'TELEGRAM_BOT_TOKEN' }
    })
    
    const telegramChatIdSetting = await prisma.setting.findUnique({
      where: { key: 'TELEGRAM_CHAT_ID' }
    })
    
    // ถ้าไม่พบค่าตั้งค่าใน DB ให้ใช้จาก env
    const telegramToken = telegramTokenSetting?.value || process.env.TELEGRAM_BOT_TOKEN
    const telegramChatId = telegramChatIdSetting?.value || process.env.TELEGRAM_CHAT_ID
    
    if (!telegramToken || !telegramChatId) {
      console.error('Telegram token or chat ID not found')
      return false
    }
    
    // สร้าง bot instance
    const bot = new TelegramBot(telegramToken)
    
    // ส่งข้อความ
    await bot.sendMessage(telegramChatId, message, { parse_mode: 'HTML' })
    
    return true
  } catch (error) {
    console.error('Failed to send Telegram notification:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// ฟังก์ชันสำหรับส่งการแจ้งเตือนการประเมินใหม่
export async function notifyNewEvaluation(evaluationId: string, evaluatorName: string, evalueeCount: number): Promise<boolean> {
  const message = `
<b>🔔 การประเมินใหม่ถูกสร้างขึ้น</b>

ผู้ประเมิน: ${evaluatorName}
จำนวนพนักงานที่ถูกประเมิน: ${evalueeCount} คน
รหัสการประเมิน: <code>${evaluationId}</code>

<i>กรุณาตรวจสอบในระบบ HR Evalify</i>
`
  
  return sendTelegramNotification(message)
}

// ฟังก์ชันสำหรับส่งการแจ้งเตือนการประเมินเสร็จสิ้น
export async function notifyCompletedEvaluation(evaluationId: string, department: string, totalEmployees: number): Promise<boolean> {
  const message = `
<b>✅ การประเมินเสร็จสิ้น</b>

แผนก: ${department}
จำนวนพนักงานที่ถูกประเมิน: ${totalEmployees} คน
รหัสการประเมิน: <code>${evaluationId}</code>

<i>รายงานผลการประเมินพร้อมให้ตรวจสอบแล้วในระบบ HR Evalify</i>
`
  
  return sendTelegramNotification(message)
}

// ฟังก์ชันสำหรับส่งการแจ้งเตือนเมื่อมีปัญหาในระบบ
export async function notifySystemError(errorMessage: string, errorLocation: string): Promise<boolean> {
  const message = `
<b>⚠️ พบข้อผิดพลาดในระบบ</b>

ตำแหน่งที่เกิดข้อผิดพลาด: ${errorLocation}
รายละเอียด: ${errorMessage}

<i>กรุณาตรวจสอบระบบโดยเร็ว</i>
`
  
  return sendTelegramNotification(message)
}