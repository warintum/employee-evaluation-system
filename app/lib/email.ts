import nodemailer from 'nodemailer'
import { formatThaiDate } from './utils'

// สร้าง transporter สำหรับส่งอีเมล
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// ฟังก์ชันสำหรับส่งอีเมลทั่วไป
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    }
    
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// ฟังก์ชันสำหรับส่งอีเมลแจ้งเตือนให้ผู้ถูกประเมินทำการประเมินตนเอง
export async function sendSelfEvaluationNotification(
  to: string,
  employeeName: string,
  evaluationPeriod: string,
  selfEvaluationUrl: string,
  dueDate: Date
): Promise<boolean> {
  const subject = 'HR Evalify - การประเมินตนเองของคุณรอการดำเนินการ'
  
  const html = `
    <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4338ca; margin-bottom: 10px;">การประเมินตนเอง</h1>
        <p style="color: #666;">สวัสดี ${employeeName}</p>
      </div>
      
      <div style="margin-bottom: 20px; color: #333;">
        <p>ระบบประเมินพนักงานได้ทำการสร้างแบบประเมินตนเองสำหรับคุณในรอบการประเมิน <strong>${evaluationPeriod}</strong></p>
        <p>กรุณาทำการประเมินตนเองภายในวันที่ <strong>${formatThaiDate(dueDate)}</strong></p>
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${selfEvaluationUrl}" style="background: linear-gradient(to right, #3b82f6, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">ประเมินตนเอง</a>
      </div>
      
      <div style="margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 14px; color: #666;">
        <p>หากคุณมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อฝ่ายทรัพยากรบุคคล</p>
        <p>อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
      </div>
    </div>
  `
  
  return sendEmail(to, subject, html)
}

// ฟังก์ชันสำหรับส่งอีเมลแจ้งเตือนให้ผู้ประเมินทำการประเมิน
export async function sendEvaluationNotification(
  to: string,
  evaluatorName: string,
  employeeCount: number,
  evaluationPeriod: string,
  evaluationUrl: string,
  dueDate: Date
): Promise<boolean> {
  const subject = 'HR Evalify - การประเมินพนักงานรอดำเนินการ'
  
  const html = `
    <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4338ca; margin-bottom: 10px;">การประเมินพนักงาน</h1>
        <p style="color: #666;">สวัสดี ${evaluatorName}</p>
      </div>
      
      <div style="margin-bottom: 20px; color: #333;">
        <p>คุณมีการประเมินพนักงานจำนวน <strong>${employeeCount} คน</strong> ที่รอดำเนินการในรอบการประเมิน <strong>${evaluationPeriod}</strong></p>
        <p>กรุณาทำการประเมินภายในวันที่ <strong>${formatThaiDate(dueDate)}</strong></p>
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${evaluationUrl}" style="background: linear-gradient(to right, #3b82f6, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">ดำเนินการประเมิน</a>
      </div>
      
      <div style="margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 14px; color: #666;">
        <p>หากคุณมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อฝ่ายทรัพยากรบุคคล</p>
        <p>อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
      </div>
    </div>
  `
  
  return sendEmail(to, subject, html)
}

// ฟังก์ชันสำหรับส่งอีเมลแจ้งเตือนให้ผู้ตรวจสอบ/ผู้จัดการตรวจสอบผลการประเมิน
export async function sendReviewNotification(
  to: string,
  reviewerName: string,
  evaluatorName: string,
  employeeCount: number,
  evaluationPeriod: string,
  reviewUrl: string
): Promise<boolean> {
  const subject = 'HR Evalify - การตรวจสอบผลการประเมินพนักงาน'
  
  const html = `
    <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4338ca; margin-bottom: 10px;">ตรวจสอบผลการประเมิน</h1>
        <p style="color: #666;">สวัสดี ${reviewerName}</p>
      </div>
      
      <div style="margin-bottom: 20px; color: #333;">
        <p>คุณ <strong>${evaluatorName}</strong> ได้ทำการประเมินพนักงานจำนวน <strong>${employeeCount} คน</strong> ในรอบการประเมิน <strong>${evaluationPeriod}</strong> เสร็จสิ้นแล้ว</p>
        <p>กรุณาตรวจสอบและพิจารณาผลการประเมิน</p>
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${reviewUrl}" style="background: linear-gradient(to right, #3b82f6, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">ตรวจสอบผลการประเมิน</a>
      </div>
      
      <div style="margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 14px; color: #666;">
        <p>หากคุณมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อฝ่ายทรัพยากรบุคคล</p>
        <p>อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
      </div>
    </div>
  `
  
  return sendEmail(to, subject, html)
}

// ฟังก์ชันสำหรับส่งอีเมลแจ้งผลการประเมินให้พนักงาน
export async function sendEvaluationResultNotification(
  to: string,
  employeeName: string,
  evaluationPeriod: string,
  finalScore: number,
  finalGrade: string,
  resultUrl: string
): Promise<boolean> {
  const subject = 'HR Evalify - ผลการประเมินของคุณ'
  
  const html = `
    <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4338ca; margin-bottom: 10px;">ผลการประเมินของคุณ</h1>
        <p style="color: #666;">สวัสดี ${employeeName}</p>
      </div>
      
      <div style="margin-bottom: 20px; color: #333;">
        <p>ผลการประเมินของคุณในรอบการประเมิน <strong>${evaluationPeriod}</strong> ได้รับการอนุมัติแล้ว</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>คะแนนรวม:</strong> ${finalScore}%</p>
          <p style="margin: 5px 0;"><strong>เกรด:</strong> ${finalGrade}</p>
        </div>
        <p>คุณสามารถดูรายละเอียดผลการประเมินได้ที่ลิงก์ด้านล่าง</p>
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${resultUrl}" style="background: linear-gradient(to right, #3b82f6, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">ดูผลการประเมิน</a>
      </div>
      
      <div style="margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 14px; color: #666;">
        <p>หากคุณมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อฝ่ายทรัพยากรบุคคล</p>
        <p>อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
      </div>
    </div>
  `
  
  return sendEmail(to, subject, html)
}

// ฟังก์ชันสำหรับส่งอีเมลแจ้งผู้ประเมินให้ประเมินใหม่ (กรณีไม่เห็นชอบ)
export async function sendRejectedEvaluationNotification(
  to: string,
  evaluatorName: string,
  reviewerName: string,
  rejectedReason: string,
  evaluationUrl: string
): Promise<boolean> {
  const subject = 'HR Evalify - การประเมินของคุณถูกส่งกลับให้แก้ไข'
  
  const html = `
    <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #DC2626; margin-bottom: 10px;">การประเมินถูกส่งกลับ</h1>
        <p style="color: #666;">สวัสดี ${evaluatorName}</p>
      </div>
      
      <div style="margin-bottom: 20px; color: #333;">
        <p>การประเมินของคุณถูกส่งกลับโดย <strong>${reviewerName}</strong> เพื่อให้ทำการแก้ไข</p>
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>เหตุผล:</strong></p>
          <p style="margin: 5px 0;">${rejectedReason}</p>
        </div>
        <p>กรุณาตรวจสอบและแก้ไขการประเมินอีกครั้ง</p>
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${evaluationUrl}" style="background: linear-gradient(to right, #ef4444, #b91c1c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">แก้ไขการประเมิน</a>
      </div>
      
      <div style="margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 14px; color: #666;">
        <p>หากคุณมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อฝ่ายทรัพยากรบุคคล</p>
        <p>อีเมลนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ</p>
      </div>
    </div>
  `
  
  return sendEmail(to, subject, html)
}