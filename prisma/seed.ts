import { PrismaClient, AttendanceType } from '@prisma/client'
import * as bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

// ฟังก์ชันสำหรับการเข้ารหัสรหัสผ่าน
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcryptjs.hash(password, saltRounds)
}

async function main() {
  console.log('เริ่มต้นเพิ่มข้อมูลตัวอย่าง...')

  // ล้างข้อมูลเดิม (ถ้าต้องการ)
  // คำเตือน: การล้างข้อมูลจะลบทุกอย่างในฐานข้อมูล
  // await clearDatabase()

  // เพิ่มข้อมูลตัวอย่าง
  await createUsers()
  await createCategories()
  await createQuestions()
  await createEvaluatorSetups()
  await createDeductionRules()
  await createGradeRules()
  await createTelegramSettings()

  console.log('เพิ่มข้อมูลตัวอย่างเรียบร้อยแล้ว')
}

// ล้างข้อมูลเดิมทั้งหมด (ใช้ด้วยความระมัดระวัง)
async function clearDatabase() {
  console.log('กำลังล้างข้อมูลเดิม...')
  
  // ล้างข้อมูลตามลำดับ เพื่อไม่ให้เกิดปัญหา foreign key constraints
  await prisma.answer.deleteMany({})
  await prisma.selfAnswer.deleteMany({})
  await prisma.selfEvaluation.deleteMany({})
  await prisma.evaluation.deleteMany({})
  await prisma.question.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.attendance.deleteMany({})
  await prisma.evaluatorSetup.deleteMany({})
  await prisma.deductionRule.deleteMany({})
  await prisma.gradeRule.deleteMany({})
  await prisma.setting.deleteMany({})
  await prisma.user.deleteMany({})
  
  console.log('ล้างข้อมูลเดิมเรียบร้อยแล้ว')
}

// สร้างผู้ใช้ตัวอย่าง
async function createUsers() {
  console.log('กำลังสร้างผู้ใช้ตัวอย่าง...')
  
  // สร้างรหัสผ่านที่เข้ารหัสแล้ว
  const adminPassword = await hashPassword('1234')
  const userPassword = await hashPassword('1234')
  
  // สร้างผู้ดูแลระบบ
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: adminPassword,
      firstName: 'ผู้ดูแล',
      lastName: 'ระบบ',
      employeeId: 'ADMIN001',
      role: 'ADMIN',
      position: 'ผู้ดูแลระบบ',
      department: 'ฝ่ายบุคคล',
    },
  })
  
  // สร้าง Admin HR
  const adminHr = await prisma.user.upsert({
    where: { email: 'hr@test.com' },
    update: {},
    create: {
      email: 'hr@test.com',
      password: userPassword,
      firstName: 'เจ้าหน้าที่',
      lastName: 'บุคคล',
      employeeId: 'HR001',
      role: 'ADMIN_HR',
      position: 'เจ้าหน้าที่ฝ่ายบุคคล',
      department: 'ฝ่ายบุคคล',
    },
  })
  
  // สร้างผู้จัดการฝ่ายขาย
  const salesManager = await prisma.user.upsert({
    where: { email: 'salesmanager@test.com' },
    update: {},
    create: {
      email: 'salesmanager@test.com',
      password: userPassword,
      firstName: 'วิชัย',
      lastName: 'รักงานขาย',
      employeeId: 'SM001',
      role: 'MANAGER',
      position: 'ผู้จัดการฝ่ายขาย',
      department: 'ฝ่ายขาย',
    },
  })
  
  // สร้างผู้ตรวจสอบฝ่ายขาย
  const salesReviewer = await prisma.user.upsert({
    where: { email: 'salesreviewer@test.com' },
    update: {},
    create: {
      email: 'salesreviewer@test.com',
      password: userPassword,
      firstName: 'สมศักดิ์',
      lastName: 'ตรวจสอบ',
      employeeId: 'SR001',
      role: 'REVIEWER',
      position: 'หัวหน้าทีมขาย',
      department: 'ฝ่ายขาย',
    },
  })
  
  // สร้างผู้ประเมินฝ่ายขาย
  const salesEvaluator = await prisma.user.upsert({
    where: { email: 'saleseval@test.com' },
    update: {},
    create: {
      email: 'saleseval@test.com',
      password: userPassword,
      firstName: 'พิมพา',
      lastName: 'ประเมินขาย',
      employeeId: 'SE001',
      role: 'EVALUATOR',
      position: 'ผู้ช่วยหัวหน้าทีมขาย',
      department: 'ฝ่ายขาย',
    },
  })
  
  // สร้างพนักงานฝ่ายขาย
  const salesUser1 = await prisma.user.upsert({
    where: { email: 'sales1@test.com' },
    update: {},
    create: {
      email: 'sales1@test.com',
      password: userPassword,
      firstName: 'สมชาย',
      lastName: 'ขายเก่ง',
      employeeId: 'S001',
      role: 'USER',
      position: 'พนักงานขาย',
      department: 'ฝ่ายขาย',
    },
  })
  
  const salesUser2 = await prisma.user.upsert({
    where: { email: 'sales2@test.com' },
    update: {},
    create: {
      email: 'sales2@test.com',
      password: userPassword,
      firstName: 'สมหญิง',
      lastName: 'รักการขาย',
      employeeId: 'S002',
      role: 'USER',
      position: 'พนักงานขาย',
      department: 'ฝ่ายขาย',
    },
  })
  
  // สร้างผู้จัดการฝ่ายไอที
  const itManager = await prisma.user.upsert({
    where: { email: 'itmanager@test.com' },
    update: {},
    create: {
      email: 'itmanager@test.com',
      password: userPassword,
      firstName: 'วีระ',
      lastName: 'เทคโนโลยี',
      employeeId: 'ITM001',
      role: 'MANAGER',
      position: 'ผู้จัดการฝ่ายไอที',
      department: 'ฝ่ายไอที',
    },
  })
  
  // สร้างผู้ตรวจสอบฝ่ายไอที
  const itReviewer = await prisma.user.upsert({
    where: { email: 'itreviewer@test.com' },
    update: {},
    create: {
      email: 'itreviewer@test.com',
      password: userPassword,
      firstName: 'ศิริพร',
      lastName: 'ตรวจโค้ด',
      employeeId: 'ITR001',
      role: 'REVIEWER',
      position: 'หัวหน้าทีมพัฒนา',
      department: 'ฝ่ายไอที',
    },
  })
  
  // สร้างผู้ประเมินฝ่ายไอที
  const itEvaluator = await prisma.user.upsert({
    where: { email: 'iteval@test.com' },
    update: {},
    create: {
      email: 'iteval@test.com',
      password: userPassword,
      firstName: 'ธนพล',
      lastName: 'ประเมินโค้ด',
      employeeId: 'ITE001',
      role: 'EVALUATOR',
      position: 'ผู้ช่วยหัวหน้าทีมพัฒนา',
      department: 'ฝ่ายไอที',
    },
  })
  
  // สร้างพนักงานฝ่ายไอที
  const itUser1 = await prisma.user.upsert({
    where: { email: 'developer1@test.com' },
    update: {},
    create: {
      email: 'developer1@test.com',
      password: userPassword,
      firstName: 'นภัส',
      lastName: 'โค้ดเดอร์',
      employeeId: 'IT001',
      role: 'USER',
      position: 'นักพัฒนาซอฟต์แวร์',
      department: 'ฝ่ายไอที',
    },
  })
  
  const itUser2 = await prisma.user.upsert({
    where: { email: 'developer2@test.com' },
    update: {},
    create: {
      email: 'developer2@test.com',
      password: userPassword,
      firstName: 'ศุภชัย',
      lastName: 'เว็บแมสเตอร์',
      employeeId: 'IT002',
      role: 'USER',
      position: 'นักพัฒนาเว็บไซต์',
      department: 'ฝ่ายไอที',
    },
  })
  
  console.log('สร้างผู้ใช้ตัวอย่างเรียบร้อยแล้ว')
}

// สร้างหมวดหมู่คำถามตัวอย่าง
async function createCategories() {
  console.log('กำลังสร้างหมวดหมู่คำถาม...')
  
  const categories = [
    {
      name: 'ความรู้ความสามารถ',
      description: 'ประเมินความรู้และทักษะในการทำงาน',
      position: 'ทั่วไป' // สำหรับทุกตำแหน่ง
    },
    {
      name: 'การทำงานเป็นทีม',
      description: 'ประเมินความสามารถในการทำงานร่วมกับผู้อื่น',
      position: 'ทั่วไป' // สำหรับทุกตำแหน่ง
    },
    {
      name: 'ความรับผิดชอบ',
      description: 'ประเมินความรับผิดชอบและความตรงต่อเวลา',
      position: 'ทั่วไป' // สำหรับทุกตำแหน่ง
    },
    {
      name: 'การขาย',
      description: 'ประเมินทักษะและผลงานด้านการขาย',
      position: 'พนักงานขาย' // เฉพาะพนักงานขาย
    },
    {
      name: 'การพัฒนาซอฟต์แวร์',
      description: 'ประเมินทักษะและคุณภาพการพัฒนาโค้ด',
      position: 'นักพัฒนาซอฟต์แวร์' // เฉพาะนักพัฒนา
    }
  ]
  
  for (const category of categories) {
    // ตรวจสอบว่ามีหมวดหมู่นี้อยู่แล้วหรือไม่
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: category.name,
        position: category.position
      }
    })
    
    if (existingCategory) {
      // ถ้ามีอยู่แล้ว ให้อัปเดต
      await prisma.category.update({
        where: { id: existingCategory.id },
        data: category
      })
    } else {
      // ถ้ายังไม่มี ให้สร้างใหม่
      await prisma.category.create({
        data: category
      })
    }
  }
  
  console.log('สร้างหมวดหมู่คำถามเรียบร้อยแล้ว')
}

// สร้างคำถามตัวอย่าง
async function createQuestions() {
  console.log('กำลังสร้างคำถาม...')
  
  // ดึงข้อมูลหมวดหมู่
  const categories = await prisma.category.findMany()
  
  // สร้าง Map เพื่อความสะดวกในการค้นหา
  const categoryMap = new Map()
  categories.forEach(category => {
    categoryMap.set(category.name, category.id)
  })
  
  // คำถามทั่วไป
  const generalQuestions = [
    // หมวดความรู้ความสามารถ
    {
      text: 'มีความรู้และทักษะที่จำเป็นในการปฏิบัติงาน',
      categoryId: categoryMap.get('ความรู้ความสามารถ')
    },
    {
      text: 'มีความเข้าใจในระบบและกระบวนการทำงาน',
      categoryId: categoryMap.get('ความรู้ความสามารถ')
    },
    {
      text: 'สามารถแก้ไขปัญหาเฉพาะหน้าได้ดี',
      categoryId: categoryMap.get('ความรู้ความสามารถ')
    },
    
    // หมวดการทำงานเป็นทีม
    {
      text: 'ให้ความร่วมมือกับทีมเป็นอย่างดี',
      categoryId: categoryMap.get('การทำงานเป็นทีม')
    },
    {
      text: 'รับฟังความคิดเห็นของผู้อื่น',
      categoryId: categoryMap.get('การทำงานเป็นทีม')
    },
    {
      text: 'มีส่วนร่วมในการแสดงความคิดเห็นที่เป็นประโยชน์',
      categoryId: categoryMap.get('การทำงานเป็นทีม')
    },
    
    // หมวดความรับผิดชอบ
    {
      text: 'ทำงานที่ได้รับมอบหมายเสร็จตามกำหนดเวลา',
      categoryId: categoryMap.get('ความรับผิดชอบ')
    },
    {
      text: 'มีความตรงต่อเวลาในการทำงาน',
      categoryId: categoryMap.get('ความรับผิดชอบ')
    },
    {
      text: 'มีความรับผิดชอบต่องานที่ได้รับมอบหมาย',
      categoryId: categoryMap.get('ความรับผิดชอบ')
    }
  ]
  
  // คำถามสำหรับพนักงานขาย
  const salesQuestions = [
    {
      text: 'สามารถนำเสนอสินค้าและบริการได้อย่างน่าสนใจ',
      categoryId: categoryMap.get('การขาย')
    },
    {
      text: 'สามารถบรรลุเป้าหมายยอดขายที่กำหนด',
      categoryId: categoryMap.get('การขาย')
    },
    {
      text: 'มีทักษะการสื่อสารและเจรจาต่อรองที่ดี',
      categoryId: categoryMap.get('การขาย')
    },
    {
      text: 'สามารถจัดการข้อโต้แย้งและข้อสงสัยของลูกค้าได้',
      categoryId: categoryMap.get('การขาย')
    }
  ]
  
  // คำถามสำหรับนักพัฒนา
  const developerQuestions = [
    {
      text: 'เขียนโค้ดได้มีคุณภาพและมีมาตรฐาน',
      categoryId: categoryMap.get('การพัฒนาซอฟต์แวร์')
    },
    {
      text: 'สามารถแก้ไขบั๊กและปัญหาทางเทคนิคได้อย่างมีประสิทธิภาพ',
      categoryId: categoryMap.get('การพัฒนาซอฟต์แวร์')
    },
    {
      text: 'มีความรู้และทักษะในเทคโนโลยีที่ใช้ในองค์กร',
      categoryId: categoryMap.get('การพัฒนาซอฟต์แวร์')
    },
    {
      text: 'สามารถเรียนรู้เทคโนโลยีใหม่ๆ ได้อย่างรวดเร็ว',
      categoryId: categoryMap.get('การพัฒนาซอฟต์แวร์')
    }
  ]
  
  // รวมคำถามทั้งหมด
  const allQuestions = [...generalQuestions, ...salesQuestions, ...developerQuestions]
  
  // สร้างคำถามในฐานข้อมูล
  for (const question of allQuestions) {
    // ตรวจสอบว่ามีคำถามนี้อยู่แล้วหรือไม่
    const existingQuestion = await prisma.question.findFirst({
      where: {
        text: question.text,
        categoryId: question.categoryId
      }
    })
    
    if (!existingQuestion) {
      await prisma.question.create({
        data: question
      })
    }
  }
  
  console.log('สร้างคำถามเรียบร้อยแล้ว')
}

// สร้างการตั้งค่าลำดับผู้ประเมิน
async function createEvaluatorSetups() {
  console.log('กำลังตั้งค่าลำดับผู้ประเมิน...')
  
  // ดึงข้อมูลผู้ใช้
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'EVALUATOR' },
        { role: 'REVIEWER' },
        { role: 'MANAGER' }
      ]
    }
  })
  
  // สร้าง Map เพื่อความสะดวกในการค้นหา
  const userMap = new Map()
  users.forEach(user => {
    const key = `${user.role}_${user.department}`
    userMap.set(key, user.id)
  })
  
  // สร้างการตั้งค่าลำดับผู้ประเมินสำหรับแต่ละแผนก
  const departments = ['ฝ่ายขาย', 'ฝ่ายไอที', 'ฝ่ายบุคคล']
  
  for (const department of departments) {
    // ตรวจสอบว่ามีผู้ประเมินครบตามลำดับหรือไม่
    const evaluatorId = userMap.get(`EVALUATOR_${department}`)
    const reviewerId = userMap.get(`REVIEWER_${department}`)
    const managerId = userMap.get(`MANAGER_${department}`)
    
    if (evaluatorId && reviewerId && managerId) {
      // ตรวจสอบว่ามีการตั้งค่าสำหรับแผนกนี้อยู่แล้วหรือไม่
      const existingSetup = await prisma.evaluatorSetup.findFirst({
        where: { departmentId: department }
      })
      
      if (existingSetup) {
        // อัปเดตถ้ามีอยู่แล้ว
        await prisma.evaluatorSetup.update({
          where: { id: existingSetup.id },
          data: {
            evaluatorId,
            reviewerId,
            managerId
          }
        })
      } else {
        // สร้างใหม่ถ้ายังไม่มี
        await prisma.evaluatorSetup.create({
          data: {
            departmentId: department,
            evaluatorId,
            reviewerId,
            managerId
          }
        })
      }
    } else {
      // ถ้าไม่ครบ ให้ใช้ข้อมูลจากผู้ใช้ที่มีบทบาท ADMIN แทน
      const adminUsers = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        take: 1
      })
      
      if (adminUsers.length > 0) {
        const adminId = adminUsers[0].id
        
        // ตรวจสอบว่ามีการตั้งค่าสำหรับแผนกนี้อยู่แล้วหรือไม่
        const existingSetup = await prisma.evaluatorSetup.findFirst({
          where: { departmentId: department }
        })
        
        if (existingSetup) {
          // อัปเดตถ้ามีอยู่แล้ว
          await prisma.evaluatorSetup.update({
            where: { id: existingSetup.id },
            data: {
              evaluatorId: evaluatorId || adminId,
              reviewerId: reviewerId || adminId,
              managerId: managerId || adminId
            }
          })
        } else {
          // สร้างใหม่ถ้ายังไม่มี
          await prisma.evaluatorSetup.create({
            data: {
              departmentId: department,
              evaluatorId: evaluatorId || adminId,
              reviewerId: reviewerId || adminId,
              managerId: managerId || adminId
            }
          })
        }
      }
    }
  }
  
  console.log('ตั้งค่าลำดับผู้ประเมินเรียบร้อยแล้ว')
}

// สร้างกฎการหักคะแนน
async function createDeductionRules() {
  console.log('กำลังสร้างกฎการหักคะแนน...')
  
  const deductionRules = [
    {
      type: AttendanceType.LATE,
      points: 0.5,
      maxCount: 5, // มาสายได้ไม่เกิน 5 ครั้ง
      forceGrade: null
    },
    {
      type: AttendanceType.ABSENT,
      points: 5,
      maxCount: 2, // ขาดงานได้ไม่เกิน 2 ครั้ง
      forceGrade: 'C' // ถ้าเกิน maxCount ให้ได้เกรด C
    },
    {
      type: AttendanceType.SICK_LEAVE,
      points: 0.2,
      maxCount: 10, // ลาป่วยได้ไม่เกิน 10 ครั้ง
      forceGrade: null
    },
    {
      type: AttendanceType.PERSONAL_LEAVE,
      points: 0.3,
      maxCount: 5, // ลากิจได้ไม่เกิน 5 ครั้ง
      forceGrade: null
    },
    {
      type: AttendanceType.VACATION,
      points: 0,
      maxCount: null, // ไม่จำกัดจำนวนวันพักร้อน
      forceGrade: null
    },
    {
      type: AttendanceType.OTHER,
      points: 0.1,
      maxCount: 10,
      forceGrade: null
    }
  ]
  
  for (const rule of deductionRules) {
    // ตรวจสอบว่ามีกฎนี้อยู่แล้วหรือไม่
    const existingRule = await prisma.deductionRule.findFirst({
      where: { type: rule.type }
    })
    
    if (existingRule) {
      // อัปเดตถ้ามีอยู่แล้ว - สร้าง object ใหม่ที่ไม่มี type เพื่อป้องกันปัญหา
      const { type, ...updateData } = rule
      await prisma.deductionRule.update({
        where: { id: existingRule.id },
        data: updateData
      })
    } else {
      // สร้างใหม่ถ้ายังไม่มี
      await prisma.deductionRule.create({
        data: rule
      })
    }
  }
  
  console.log('สร้างกฎการหักคะแนนเรียบร้อยแล้ว')
}

// สร้างเกณฑ์การให้เกรด
async function createGradeRules() {
  console.log('กำลังสร้างเกณฑ์การให้เกรด...')
  
  const gradeRules = [
    {
      grade: 'A',
      minScore: 90,
      maxScore: 100,
      description: 'ดีเยี่ยม'
    },
    {
      grade: 'B+',
      minScore: 80,
      maxScore: 89.99,
      description: 'ดีมาก'
    },
    {
      grade: 'B',
      minScore: 70,
      maxScore: 79.99,
      description: 'ดี'
    },
    {
      grade: 'C+',
      minScore: 60,
      maxScore: 69.99,
      description: 'ค่อนข้างดี'
    },
    {
      grade: 'C',
      minScore: 50,
      maxScore: 59.99,
      description: 'พอใช้'
    },
    {
      grade: 'D+',
      minScore: 40,
      maxScore: 49.99,
      description: 'อ่อน'
    },
    {
      grade: 'D',
      minScore: 30,
      maxScore: 39.99,
      description: 'อ่อนมาก'
    },
    {
      grade: 'F',
      minScore: 0,
      maxScore: 29.99,
      description: 'ไม่ผ่าน'
    }
  ]
  
  for (const rule of gradeRules) {
    // ตรวจสอบว่ามีเกณฑ์นี้อยู่แล้วหรือไม่
    const existingRule = await prisma.gradeRule.findFirst({
      where: { grade: rule.grade }
    })
    
    if (existingRule) {
      // อัปเดตถ้ามีอยู่แล้ว
      await prisma.gradeRule.update({
        where: { id: existingRule.id },
        data: rule
      })
    } else {
      // สร้างใหม่ถ้ายังไม่มี
      await prisma.gradeRule.create({
        data: rule
      })
    }
  }
  
  console.log('สร้างเกณฑ์การให้เกรดเรียบร้อยแล้ว')
}

// สร้างการตั้งค่า Telegram
async function createTelegramSettings() {
  console.log('กำลังสร้างการตั้งค่า Telegram...')
  
  // ตั้งค่าข้อมูลตัวอย่าง (ในการใช้งานจริง ให้แก้ไขเป็นค่าจริง)
  const telegramSettings = [
    {
      key: 'TELEGRAM_BOT_TOKEN',
      value: 'your_telegram_bot_token',
      description: 'Token สำหรับ Telegram Bot'
    },
    {
      key: 'TELEGRAM_CHAT_ID',
      value: 'your_telegram_chat_id',
      description: 'Chat ID สำหรับการส่งข้อความผ่าน Telegram'
    }
  ]
  
  for (const setting of telegramSettings) {
    // ตรวจสอบว่ามีการตั้งค่านี้อยู่แล้วหรือไม่
    const existingSetting = await prisma.setting.findUnique({
      where: { key: setting.key }
    })
    
    if (existingSetting) {
      // อัปเดตถ้ามีอยู่แล้ว
      await prisma.setting.update({
        where: { id: existingSetting.id },
        data: setting
      })
    } else {
      // สร้างใหม่ถ้ายังไม่มี
      await prisma.setting.create({
        data: setting
      })
    }
  }
  
  console.log('สร้างการตั้งค่า Telegram เรียบร้อยแล้ว')
}

// รันฟังก์ชันหลัก
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })