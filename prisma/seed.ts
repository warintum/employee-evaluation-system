import { PrismaClient, Role, AttendanceType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // ล้างข้อมูลเก่า (ถ้าต้องการ)
  await cleanup();

  // เพิ่มผู้ใช้
  await createUsers();
  
  // เพิ่มแบบฟอร์มประเมินตัวอย่าง
  await createEvaluationTemplates();

  console.log('Seed process completed successfully!');
}

async function cleanup() {
  console.log('Cleaning up existing data...');
  
  // ลบข้อมูลตามลำดับ (ต้องระวังเรื่อง foreign key constraints)
  await prisma.itemAnswer.deleteMany();
  await prisma.selfAnswer.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.evaluationItem.deleteMany();
  await prisma.evaluationTemplate.deleteMany();
  await prisma.deductionRule.deleteMany();
  await prisma.gradeRule.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.selfEvaluation.deleteMany();
  await prisma.question.deleteMany();
  await prisma.category.deleteMany();
  await prisma.evaluatorSetup.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('All existing data has been removed');
}

async function createUsers() {
  console.log('Creating users...');
  
  // เข้ารหัสรหัสผ่าน
  const hashedPassword = await bcrypt.hash('1234', 10);
  
  // ข้อมูลผู้ใช้
  const users = [
    // Admin และ Admin HR
    {
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      employeeId: 'A001',
      role: Role.ADMIN,
      position: 'ผู้ดูแลระบบ',
      department: 'IT',
      isActive: true
    },
    {
      email: 'hr@test.com',
      password: hashedPassword,
      firstName: 'HR',
      lastName: 'Admin',
      employeeId: 'A002',
      role: Role.ADMIN_HR,
      position: 'เจ้าหน้าที่ HR',
      department: 'HR',
      isActive: true
    },
    
    // ฝ่ายขาย - ผู้บริหาร
    {
      email: 'sales.manager@test.com',
      password: hashedPassword,
      firstName: 'ทศพล',
      lastName: 'มั่งมี',
      employeeId: 'S001',
      role: Role.MANAGER,
      position: 'ผู้จัดการฝ่ายขาย',
      department: 'Sales',
      isActive: true
    },
    // ฝ่ายขาย - หัวหน้าทีม
    {
      email: 'sales.leader@test.com',
      password: hashedPassword,
      firstName: 'วัชรพล',
      lastName: 'สุริยะวงค์',
      employeeId: 'S002',
      role: Role.REVIEWER,
      position: 'หัวหน้าทีมขาย',
      department: 'Sales',
      isActive: true
    },
    // ฝ่ายขาย - พนักงานขาย (ผู้ประเมิน)
    {
      email: 'sales.evaluator@test.com',
      password: hashedPassword,
      firstName: 'สมศักดิ์',
      lastName: 'เจริญดี',
      employeeId: 'S003',
      role: Role.EVALUATOR,
      position: 'พนักงานขายอาวุโส',
      department: 'Sales',
      isActive: true
    },
    // ฝ่ายขาย - พนักงานขาย (ผู้ถูกประเมิน 1)
    {
      email: 'sales1@test.com',
      password: hashedPassword,
      firstName: 'จิตรา',
      lastName: 'ดวงดี',
      employeeId: 'S004',
      role: Role.USER,
      position: 'พนักงานขาย',
      department: 'Sales',
      isActive: true
    },
    // ฝ่ายขาย - พนักงานขาย (ผู้ถูกประเมิน 2)
    {
      email: 'sales2@test.com',
      password: hashedPassword,
      firstName: 'วิชัย',
      lastName: 'รักดี',
      employeeId: 'S005',
      role: Role.USER,
      position: 'พนักงานขาย',
      department: 'Sales',
      isActive: true
    },
    
    // ฝ่ายไอที - ผู้บริหาร
    {
      email: 'it.manager@test.com',
      password: hashedPassword,
      firstName: 'ธนัท',
      lastName: 'เทคโนไทย',
      employeeId: 'IT001',
      role: Role.MANAGER,
      position: 'ผู้จัดการฝ่ายไอที',
      department: 'IT',
      isActive: true
    },
    // ฝ่ายไอที - หัวหน้าทีม
    {
      email: 'it.leader@test.com',
      password: hashedPassword,
      firstName: 'กอบกาญจน์',
      lastName: 'โปรแกรมเมอร์',
      employeeId: 'IT002',
      role: Role.REVIEWER,
      position: 'หัวหน้าทีมพัฒนาซอฟต์แวร์',
      department: 'IT',
      isActive: true
    },
    // ฝ่ายไอที - โปรแกรมเมอร์อาวุโส (ผู้ประเมิน)
    {
      email: 'it.evaluator@test.com',
      password: hashedPassword,
      firstName: 'วิทยา',
      lastName: 'โค้ดดิ้ง',
      employeeId: 'IT003',
      role: Role.EVALUATOR,
      position: 'โปรแกรมเมอร์อาวุโส',
      department: 'IT',
      isActive: true
    },
    // ฝ่ายไอที - โปรแกรมเมอร์ (ผู้ถูกประเมิน 1)
    {
      email: 'it1@test.com',
      password: hashedPassword,
      firstName: 'ดวงใจ',
      lastName: 'เว็บเดเวลอปเปอร์',
      employeeId: 'IT004',
      role: Role.USER,
      position: 'โปรแกรมเมอร์',
      department: 'IT',
      isActive: true
    },
    // ฝ่ายไอที - โปรแกรมเมอร์ (ผู้ถูกประเมิน 2)
    {
      email: 'it2@test.com',
      password: hashedPassword,
      firstName: 'จักรกฤษณ์',
      lastName: 'มือถือเดเวลอปเปอร์',
      employeeId: 'IT005',
      role: Role.USER,
      position: 'โปรแกรมเมอร์',
      department: 'IT',
      isActive: true
    }
  ];
  
  // บันทึกข้อมูลผู้ใช้
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData
    });
    console.log(`Created user: ${user.firstName} ${user.lastName} (${user.email})`);
  }
  
  // ตั้งค่าลำดับผู้ประเมินสำหรับแต่ละแผนก
  await setupEvaluators();
  
  console.log('All users created successfully');
}

async function setupEvaluators() {
  console.log('Setting up evaluator chains...');
  
  // ดึงข้อมูล ID ของผู้ใช้
  const salesManager = await prisma.user.findUnique({ where: { email: 'sales.manager@test.com' } });
  const salesLeader = await prisma.user.findUnique({ where: { email: 'sales.leader@test.com' } });
  const salesEvaluator = await prisma.user.findUnique({ where: { email: 'sales.evaluator@test.com' } });
  
  const itManager = await prisma.user.findUnique({ where: { email: 'it.manager@test.com' } });
  const itLeader = await prisma.user.findUnique({ where: { email: 'it.leader@test.com' } });
  const itEvaluator = await prisma.user.findUnique({ where: { email: 'it.evaluator@test.com' } });
  
  // เพิ่มข้อมูลลำดับผู้ประเมินสำหรับแผนกขาย
  await prisma.evaluatorSetup.create({
    data: {
      departmentId: 'Sales',
      evaluatorId: salesEvaluator?.id || '',
      reviewerId: salesLeader?.id || '',
      managerId: salesManager?.id || ''
    }
  });
  
  // เพิ่มข้อมูลลำดับผู้ประเมินสำหรับแผนกไอที
  await prisma.evaluatorSetup.create({
    data: {
      departmentId: 'IT',
      evaluatorId: itEvaluator?.id || '',
      reviewerId: itLeader?.id || '',
      managerId: itManager?.id || ''
    }
  });
  
  console.log('Evaluator chains setup complete');
}

async function createEvaluationTemplates() {
  console.log('Creating evaluation templates...');
  
  // สร้างแบบฟอร์มประเมินสำหรับพนักงานขาย
  const salesTemplate = await prisma.evaluationTemplate.create({
    data: {
      name: 'แบบประเมินพนักงานขาย',
      description: 'แบบประเมินสำหรับพนักงานขายประจำไตรมาส',
      position: 'พนักงานขาย',
      maxScore: 100,
      isActive: true
    }
  });
  
  console.log(`Created sales template: ${salesTemplate.id}`);
  
  // หัวข้อประเมินสำหรับพนักงานขาย
  const salesItems = [
    {
      templateId: salesTemplate.id,
      title: 'ยอดขาย',
      description: 'ยอดขายที่ทำได้เทียบกับเป้าหมาย',
      maxScore: 25,
      weight: 25,
      order: 1,
      gradeA_desc: 'สูงกว่าเป้าหมายมากกว่า 20%',
      gradeA_min: 21,
      gradeA_max: 25,
      gradeB_desc: 'สูงกว่าเป้าหมาย 10-20%',
      gradeB_min: 16,
      gradeB_max: 20,
      gradeC_desc: 'ตามเป้าหมาย ±10%',
      gradeC_min: 11,
      gradeC_max: 15,
      gradeD_desc: 'ต่ำกว่าเป้าหมาย 10-20%',
      gradeD_min: 6,
      gradeD_max: 10,
      gradeE_desc: 'ต่ำกว่าเป้าหมายมากกว่า 20%',
      gradeE_min: 1,
      gradeE_max: 5
    },
    {
      templateId: salesTemplate.id,
      title: 'การบริการลูกค้า',
      description: 'คุณภาพการให้บริการและการดูแลลูกค้า',
      maxScore: 20,
      weight: 20,
      order: 2,
      gradeA_desc: 'ดีเยี่ยม ได้รับคำชมจากลูกค้าเป็นประจำ',
      gradeA_min: 17,
      gradeA_max: 20,
      gradeB_desc: 'ดี มีลูกค้าชมเชยบ้าง',
      gradeB_min: 13,
      gradeB_max: 16,
      gradeC_desc: 'ปานกลาง ให้บริการได้ตามมาตรฐาน',
      gradeC_min: 9,
      gradeC_max: 12,
      gradeD_desc: 'พอใช้ มีข้อบกพร่องบ้าง',
      gradeD_min: 5,
      gradeD_max: 8,
      gradeE_desc: 'ต้องปรับปรุง มีข้อร้องเรียนจากลูกค้า',
      gradeE_min: 1,
      gradeE_max: 4
    },
    {
      templateId: salesTemplate.id,
      title: 'ความรู้ผลิตภัณฑ์',
      description: 'ความเข้าใจในผลิตภัณฑ์และการนำเสนอ',
      maxScore: 15,
      weight: 15,
      order: 3,
      gradeA_desc: 'เชี่ยวชาญ สามารถตอบคำถามได้ทุกประเด็น',
      gradeA_min: 13,
      gradeA_max: 15,
      gradeB_desc: 'ดี สามารถตอบคำถามส่วนใหญ่ได้',
      gradeB_min: 10,
      gradeB_max: 12,
      gradeC_desc: 'ปานกลาง ตอบคำถามพื้นฐานได้',
      gradeC_min: 7,
      gradeC_max: 9,
      gradeD_desc: 'พอใช้ ยังมีความเข้าใจไม่ครบถ้วน',
      gradeD_min: 4,
      gradeD_max: 6,
      gradeE_desc: 'ต้องปรับปรุง ขาดความรู้พื้นฐาน',
      gradeE_min: 1,
      gradeE_max: 3
    },
    {
      templateId: salesTemplate.id,
      title: 'การติดตามลูกค้า',
      description: 'การติดตามและดูแลลูกค้าอย่างต่อเนื่อง',
      maxScore: 15,
      weight: 15,
      order: 4,
      gradeA_desc: 'ดีเยี่ยม ติดตามอย่างสม่ำเสมอและมีระบบ',
      gradeA_min: 13,
      gradeA_max: 15,
      gradeB_desc: 'ดี ติดตามอย่างสม่ำเสมอ',
      gradeB_min: 10,
      gradeB_max: 12,
      gradeC_desc: 'ปานกลาง ติดตามตามที่กำหนด',
      gradeC_min: 7,
      gradeC_max: 9,
      gradeD_desc: 'พอใช้ ติดตามไม่ครบถ้วน',
      gradeD_min: 4,
      gradeD_max: 6,
      gradeE_desc: 'ต้องปรับปรุง แทบไม่มีการติดตาม',
      gradeE_min: 1,
      gradeE_max: 3
    },
    {
      templateId: salesTemplate.id,
      title: 'การทำงานเป็นทีม',
      description: 'การร่วมมือกับทีมและหน่วยงานอื่น',
      maxScore: 10,
      weight: 10,
      order: 5,
      gradeA_desc: 'ดีเยี่ยม เป็นผู้นำและช่วยเหลือทีม',
      gradeA_min: 9,
      gradeA_max: 10,
      gradeB_desc: 'ดี ให้ความร่วมมือเป็นอย่างดี',
      gradeB_min: 7,
      gradeB_max: 8,
      gradeC_desc: 'ปานกลาง ให้ความร่วมมือตามที่ร้องขอ',
      gradeC_min: 5,
      gradeC_max: 6,
      gradeD_desc: 'พอใช้ ให้ความร่วมมือน้อย',
      gradeD_min: 3,
      gradeD_max: 4,
      gradeE_desc: 'ต้องปรับปรุง ไม่ให้ความร่วมมือ',
      gradeE_min: 1,
      gradeE_max: 2
    },
    {
      templateId: salesTemplate.id,
      title: 'ความตรงต่อเวลา',
      description: 'การตรงต่อเวลาในการทำงานและการนัดหมาย',
      maxScore: 5,
      weight: 5,
      order: 6,
      gradeA_desc: 'ดีเยี่ยม ตรงเวลาเสมอ',
      gradeA_min: 5,
      gradeA_max: 5,
      gradeB_desc: 'ดี ตรงเวลาเกือบทุกครั้ง',
      gradeB_min: 4,
      gradeB_max: 4,
      gradeC_desc: 'ปานกลาง สายบ้างแต่ไม่บ่อย',
      gradeC_min: 3,
      gradeC_max: 3,
      gradeD_desc: 'พอใช้ สายค่อนข้างบ่อย',
      gradeD_min: 2,
      gradeD_max: 2,
      gradeE_desc: 'ต้องปรับปรุง สายเป็นประจำ',
      gradeE_min: 1,
      gradeE_max: 1
    },
    {
      templateId: salesTemplate.id,
      title: 'การรายงานข้อมูล',
      description: 'ความถูกต้องและตรงเวลาในการรายงานข้อมูลการขาย',
      maxScore: 10,
      weight: 10,
      order: 7,
      gradeA_desc: 'ดีเยี่ยม รายงานครบถ้วน ถูกต้อง และตรงเวลาเสมอ',
      gradeA_min: 9,
      gradeA_max: 10,
      gradeB_desc: 'ดี รายงานครบถ้วนและตรงเวลาเกือบทุกครั้ง',
      gradeB_min: 7,
      gradeB_max: 8,
      gradeC_desc: 'ปานกลาง รายงานได้ตามกำหนดส่วนใหญ่',
      gradeC_min: 5,
      gradeC_max: 6,
      gradeD_desc: 'พอใช้ รายงานล่าช้าบ่อยครั้ง',
      gradeD_min: 3,
      gradeD_max: 4,
      gradeE_desc: 'ต้องปรับปรุง รายงานไม่ครบถ้วนและล่าช้าเป็นประจำ',
      gradeE_min: 1,
      gradeE_max: 2
    }
  ];
  
  // บันทึกหัวข้อประเมินสำหรับพนักงานขาย
  for (const itemData of salesItems) {
    const item = await prisma.evaluationItem.create({
      data: itemData
    });
    console.log(`Created sales evaluation item: ${item.title}`);
  }
  
  // สร้างแบบฟอร์มประเมินสำหรับพนักงานไอที
  const itTemplate = await prisma.evaluationTemplate.create({
    data: {
      name: 'แบบประเมินโปรแกรมเมอร์',
      description: 'แบบประเมินสำหรับโปรแกรมเมอร์ประจำไตรมาส',
      position: 'โปรแกรมเมอร์',
      maxScore: 100,
      isActive: true
    }
  });
  
  console.log(`Created IT template: ${itTemplate.id}`);
  
  // หัวข้อประเมินสำหรับพนักงานไอที
  const itItems = [
    {
      templateId: itTemplate.id,
      title: 'คุณภาพโค้ด',
      description: 'คุณภาพของโค้ดที่เขียน ความสะอาด การบำรุงรักษา',
      maxScore: 20,
      weight: 20,
      order: 1,
      gradeA_desc: 'โค้ดมีคุณภาพสูง ง่ายต่อการบำรุงรักษา มีการทำ documentation ครบถ้วน',
      gradeA_min: 17,
      gradeA_max: 20,
      gradeB_desc: 'โค้ดมีคุณภาพดี อ่านง่าย มี documentation พอสมควร',
      gradeB_min: 13,
      gradeB_max: 16,
      gradeC_desc: 'โค้ดได้มาตรฐาน ทำงานได้ตามที่กำหนด',
      gradeC_min: 9,
      gradeC_max: 12,
      gradeD_desc: 'โค้ดทำงานได้แต่ยากต่อการบำรุงรักษา',
      gradeD_min: 5,
      gradeD_max: 8,
      gradeE_desc: 'โค้ดมีปัญหา มีข้อผิดพลาดบ่อย ยากต่อการอ่านและบำรุงรักษา',
      gradeE_min: 1,
      gradeE_max: 4
    },
    {
      templateId: itTemplate.id,
      title: 'การส่งมอบงานตรงเวลา',
      description: 'ความตรงต่อเวลาในการส่งมอบงานตามที่กำหนด',
      maxScore: 15,
      weight: 15,
      order: 2,
      gradeA_desc: 'ส่งมอบงานก่อนกำหนดเสมอ',
      gradeA_min: 13,
      gradeA_max: 15,
      gradeB_desc: 'ส่งมอบงานตรงเวลาเสมอ บางครั้งก่อนกำหนด',
      gradeB_min: 10,
      gradeB_max: 12,
      gradeC_desc: 'ส่งมอบงานตรงเวลาเป็นส่วนใหญ่',
      gradeC_min: 7,
      gradeC_max: 9,
      gradeD_desc: 'ส่งมอบงานล่าช้าบ่อยครั้ง',
      gradeD_min: 4,
      gradeD_max: 6,
      gradeE_desc: 'ส่งมอบงานล่าช้าเป็นประจำ',
      gradeE_min: 1,
      gradeE_max: 3
    },
    {
      templateId: itTemplate.id,
      title: 'ความรู้ทางเทคนิค',
      description: 'ความรู้และทักษะทางเทคนิคที่เกี่ยวข้องกับงาน',
      maxScore: 20,
      weight: 20,
      order: 3,
      gradeA_desc: 'มีความรู้ลึกซึ้ง สามารถแก้ปัญหาซับซ้อนได้',
      gradeA_min: 17,
      gradeA_max: 20,
      gradeB_desc: 'มีความรู้ดี แก้ปัญหาได้หลากหลาย',
      gradeB_min: 13,
      gradeB_max: 16,
      gradeC_desc: 'มีความรู้พอใช้ แก้ปัญหาทั่วไปได้',
      gradeC_min: 9,
      gradeC_max: 12,
      gradeD_desc: 'ความรู้จำกัด ต้องขอความช่วยเหลือบ่อย',
      gradeD_min: 5,
      gradeD_max: 8,
      gradeE_desc: 'ขาดความรู้พื้นฐาน ต้องได้รับการสอนเสมอ',
      gradeE_min: 1,
      gradeE_max: 4
    },
    {
      templateId: itTemplate.id,
      title: 'การทำงานเป็นทีม',
      description: 'การทำงานร่วมกับผู้อื่นและการสื่อสาร',
      maxScore: 15,
      weight: 15,
      order: 4,
      gradeA_desc: 'ทำงานร่วมกับผู้อื่นได้ดีเยี่ยม มีภาวะผู้นำ',
      gradeA_min: 13,
      gradeA_max: 15,
      gradeB_desc: 'ทำงานร่วมกับผู้อื่นได้ดี ช่วยเหลือเพื่อนร่วมทีม',
      gradeB_min: 10,
      gradeB_max: 12,
      gradeC_desc: 'ทำงานร่วมกับผู้อื่นได้ตามปกติ',
      gradeC_min: 7,
      gradeC_max: 9,
      gradeD_desc: 'บางครั้งมีปัญหาในการทำงานร่วมกับผู้อื่น',
      gradeD_min: 4,
      gradeD_max: 6,
      gradeE_desc: 'ทำงานร่วมกับผู้อื่นได้ยาก มีปัญหาบ่อย',
      gradeE_min: 1,
      gradeE_max: 3
    },
    {
      templateId: itTemplate.id,
      title: 'การแก้ไขปัญหา',
      description: 'ความสามารถในการแก้ไขปัญหาและความคิดสร้างสรรค์',
      maxScore: 15,
      weight: 15,
      order: 5,
      gradeA_desc: 'แก้ไขปัญหาได้อย่างสร้างสรรค์และมีประสิทธิภาพสูง',
      gradeA_min: 13,
      gradeA_max: 15,
      gradeB_desc: 'แก้ไขปัญหาได้ดี มีวิธีการที่เหมาะสม',
      gradeB_min: 10,
      gradeB_max: 12,
      gradeC_desc: 'แก้ไขปัญหาได้ตามปกติ',
      gradeC_min: 7,
      gradeC_max: 9,
      gradeD_desc: 'แก้ไขปัญหาได้บ้าง แต่ต้องการคำแนะนำ',
      gradeD_min: 4,
      gradeD_max: 6,
      gradeE_desc: 'แก้ไขปัญหาได้น้อย ต้องการความช่วยเหลือเสมอ',
      gradeE_min: 1,
      gradeE_max: 3
    },
    {
      templateId: itTemplate.id,
      title: 'การเรียนรู้เทคโนโลยีใหม่',
      description: 'ความสามารถในการเรียนรู้และปรับตัวกับเทคโนโลยีใหม่',
      maxScore: 10,
      weight: 10,
      order: 6,
      gradeA_desc: 'เรียนรู้เร็วมาก เป็นผู้นำในการใช้เทคโนโลยีใหม่',
      gradeA_min: 9,
      gradeA_max: 10,
      gradeB_desc: 'เรียนรู้ได้เร็ว นำไปประยุกต์ใช้ได้ดี',
      gradeB_min: 7,
      gradeB_max: 8,
      gradeC_desc: 'เรียนรู้ได้ตามปกติ ตามทันเทคโนโลยี',
      gradeC_min: 5,
      gradeC_max: 6,
      gradeD_desc: 'เรียนรู้ได้ช้า ต้องใช้เวลา',
      gradeD_min: 3,
      gradeD_max: 4,
      gradeE_desc: 'ไม่สนใจเรียนรู้สิ่งใหม่ ยึดติดกับเทคโนโลยีเดิม',
      gradeE_min: 1,
      gradeE_max: 2
    },
    {
      templateId: itTemplate.id,
      title: 'การทดสอบและ QA',
      description: 'การทดสอบโค้ดและความใส่ใจในคุณภาพ',
      maxScore: 5,
      weight: 5,
      order: 7,
      gradeA_desc: 'ทดสอบอย่างครอบคลุม มี unit tests ครบถ้วน',
      gradeA_min: 5,
      gradeA_max: 5,
      gradeB_desc: 'ทดสอบดี มี unit tests ส่วนใหญ่',
      gradeB_min: 4,
      gradeB_max: 4,
      gradeC_desc: 'ทดสอบพอสมควร มี unit tests บ้าง',
      gradeC_min: 3,
      gradeC_max: 3,
      gradeD_desc: 'ทดสอบน้อย แทบไม่มี unit tests',
      gradeD_min: 2,
      gradeD_max: 2,
      gradeE_desc: 'ไม่ทดสอบ ปล่อยให้ QA หรือผู้ใช้พบปัญหา',
      gradeE_min: 1,
      gradeE_max: 1
    }
  ];
  
  // บันทึกหัวข้อประเมินสำหรับพนักงานไอที
  for (const itemData of itItems) {
    const item = await prisma.evaluationItem.create({
      data: itemData
    });
    console.log(`Created IT evaluation item: ${item.title}`);
  }
  
  // สร้างแบบฟอร์มประเมินสำหรับพนักงานรายวันทั่วไป
  const generalTemplate = await prisma.evaluationTemplate.create({
    data: {
      name: 'แบบประเมินพนักงานรายวันทั่วไป',
      description: 'แบบประเมินสำหรับพนักงานรายวันทั่วไป',
      position: 'พนักงานรายวันทั่วไป',
      maxScore: 100,
      isActive: true
    }
  });
  
  console.log(`Created general staff template: ${generalTemplate.id}`);
  
  // หัวข้อประเมินสำหรับพนักงานรายวันทั่วไป
  const generalItems = [
    {
      templateId: generalTemplate.id,
      title: 'ปริมาณงาน',
      description: 'ปริมาณงานที่ทำได้เทียบกับเป้าหมาย',
      maxScore: 15,
      weight: 15,
      order: 1,
      gradeA_desc: 'สูงกว่าที่ได้กำหนดไว้เป็นประจำ',
      gradeA_min: 13,
      gradeA_max: 15,
      gradeB_desc: 'มากกว่าที่กำหนดไว้เป็นบางครั้งบางคราว',
      gradeB_min: 10,
      gradeB_max: 12,
      gradeC_desc: 'เท่ากับหรือใกล้เคียงที่กำหนดไว้',
      gradeC_min: 7,
      gradeC_max: 9,
      gradeD_desc: 'น้อยกว่าที่กำหนดไว้เป็นบางครั้ง',
      gradeD_min: 4,
      gradeD_max: 6,
      gradeE_desc: 'ต่ำกว่าที่กำหนดไว้บ่อยๆ',
      gradeE_min: 1,
      gradeE_max: 3
    },
    {
      templateId: generalTemplate.id,
      title: 'คุณภาพงาน',
      description: 'คุณภาพของงานที่ทำ',
      maxScore: 15,
      weight: 15,
      order: 2,
      gradeA_desc: 'ดีเยี่ยม ไม่มีข้อผิดพลาด',
      gradeA_min: 13,
      gradeA_max: 15,
      gradeB_desc: 'ดี มีข้อผิดพลาดน้อยมาก',
      gradeB_min: 10,
      gradeB_max: 12,
      gradeC_desc: 'ปานกลาง มีข้อผิดพลาดบ้าง',
      gradeC_min: 7,
      gradeC_max: 9,
      gradeD_desc: 'พอใช้ มีข้อผิดพลาดค่อนข้างบ่อย',
      gradeD_min: 4,
      gradeD_max: 6,
      gradeE_desc: 'ต้องปรับปรุง มีข้อผิดพลาดเป็นประจำ',
      gradeE_min: 1,
      gradeE_max: 3
    },
    {
      templateId: generalTemplate.id,
      title: 'การตรงต่อเวลา',
      description: 'การมาทำงานตรงเวลา',
      maxScore: 10,
      weight: 10,
      order: 3,
      gradeA_desc: 'ตรงเวลาเสมอ ไม่เคยมาสาย',
      gradeA_min: 9,
      gradeA_max: 10,
      gradeB_desc: 'ตรงเวลาเกือบทุกครั้ง สายนาน ๆ ครั้ง',
      gradeB_min: 7,
      gradeB_max: 8,
      gradeC_desc: 'มาสายบ้างเป็นบางครั้ง',
      gradeC_min: 5,
      gradeC_max: 6,
      gradeD_desc: 'มาสายค่อนข้างบ่อย',
      gradeD_min: 3,
      gradeD_max: 4,
      gradeE_desc: 'มาสายเป็นประจำ',
      gradeE_min: 1,
      gradeE_max: 2
    },
    {
      templateId: generalTemplate.id,
      title: 'การร่วมมือกับทีม',
      description: 'การทำงานร่วมกับผู้อื่น',
      maxScore: 10,
      weight: 10,
      order: 4,
      gradeA_desc: 'ร่วมมือดีเยี่ยม ช่วยเหลือผู้อื่นเสมอ',
      gradeA_min: 9,
      gradeA_max: 10,
      gradeB_desc: 'ร่วมมือดี ช่วยเหลือผู้อื่นบ่อยครั้ง',
      gradeB_min: 7,
      gradeB_max: 8,
      gradeC_desc: 'ร่วมมือปานกลาง ช่วยเหลือเมื่อมีการร้องขอ',
      gradeC_min: 5,
      gradeC_max: 6,
      gradeD_desc: 'ร่วมมือน้อย ไม่ค่อยให้ความช่วยเหลือ',
      gradeD_min: 3,
      gradeD_max: 4,
      gradeE_desc: 'ไม่ร่วมมือ ไม่ช่วยเหลือผู้อื่น',
      gradeE_min: 1,
      gradeE_max: 2
    },
    {
      templateId: generalTemplate.id,
      title: 'ความรับผิดชอบ',
      description: 'ความรับผิดชอบต่องานที่ได้รับมอบหมาย',
      maxScore: 15,
      weight: 15,
      order: 5,
      gradeA_desc: 'รับผิดชอบสูงมาก ทำงานสำเร็จเสมอ',
      gradeA_min: 13,
      gradeA_max: 15,
      gradeB_desc: 'รับผิดชอบดี ทำงานสำเร็จเกือบทุกครั้ง',
      gradeB_min: 10,
      gradeB_max: 12,
      gradeC_desc: 'รับผิดชอบปานกลาง ทำงานสำเร็จเป็นส่วนใหญ่',
      gradeC_min: 7,
      gradeC_max: 9,
      gradeD_desc: 'รับผิดชอบน้อย ทำงานไม่สำเร็จบ่อยครั้ง',
      gradeD_min: 4,
      gradeD_max: 6,
      gradeE_desc: 'ขาดความรับผิดชอบ ทำงานไม่สำเร็จเป็นประจำ',
      gradeE_min: 1,
      gradeE_max: 3
    },
    {
      templateId: generalTemplate.id,
      title: 'ความสะอาดและความเป็นระเบียบ',
      description: 'การรักษาความสะอาดและความเป็นระเบียบในพื้นที่ทำงาน',
      maxScore: 10,
      weight: 10,
      order: 6,
      gradeA_desc: 'ดูแลพื้นที่ทำงานสะอาดเรียบร้อยเสมอ',
      gradeA_min: 9,
      gradeA_max: 10,
      gradeB_desc: 'พื้นที่ทำงานสะอาดเรียบร้อยเป็นส่วนใหญ่',
      gradeB_min: 7,
      gradeB_max: 8,
      gradeC_desc: 'พื้นที่ทำงานค่อนข้างสะอาดเรียบร้อย',
      gradeC_min: 5,
      gradeC_max: 6,
      gradeD_desc: 'พื้นที่ทำงานไม่ค่อยสะอาดเรียบร้อย',
      gradeD_min: 3,
      gradeD_max: 4,
      gradeE_desc: 'พื้นที่ทำงานไม่สะอาดและไม่เป็นระเบียบ',
      gradeE_min: 1,
      gradeE_max: 2
    },
    {
      templateId: generalTemplate.id,
      title: 'การปฏิบัติตามกฎระเบียบ',
      description: 'การปฏิบัติตามกฎระเบียบและนโยบายของบริษัท',
      maxScore: 10,
      weight: 10,
      order: 7,
      gradeA_desc: 'ปฏิบัติตามกฎระเบียบอย่างเคร่งครัดเสมอ',
      gradeA_min: 9,
      gradeA_max: 10,
      gradeB_desc: 'ปฏิบัติตามกฎระเบียบเกือบทุกครั้ง',
      gradeB_min: 7,
      gradeB_max: 8,
      gradeC_desc: 'ปฏิบัติตามกฎระเบียบเป็นส่วนใหญ่',
      gradeC_min: 5,
      gradeC_max: 6,
      gradeD_desc: 'ละเลยกฎระเบียบบ่อยครั้ง',
      gradeD_min: 3,
      gradeD_max: 4,
      gradeE_desc: 'ไม่ปฏิบัติตามกฎระเบียบเป็นประจำ',
      gradeE_min: 1,
      gradeE_max: 2
    },
    {
      templateId: generalTemplate.id,
      title: 'การใช้ทรัพยากร',
      description: 'การใช้ทรัพยากรอย่างคุ้มค่าและประหยัด',
      maxScore: 5,
      weight: 5,
      order: 8,
      gradeA_desc: 'ใช้ทรัพยากรอย่างประหยัดและคุ้มค่าที่สุด',
      gradeA_min: 5,
      gradeA_max: 5,
      gradeB_desc: 'ใช้ทรัพยากรอย่างประหยัดเป็นส่วนใหญ่',
      gradeB_min: 4,
      gradeB_max: 4,
      gradeC_desc: 'ใช้ทรัพยากรพอสมควร',
      gradeC_min: 3,
      gradeC_max: 3,
      gradeD_desc: 'ใช้ทรัพยากรสิ้นเปลืองบ่อยครั้ง',
      gradeD_min: 2,
      gradeD_max: 2,
      gradeE_desc: 'ใช้ทรัพยากรอย่างสิ้นเปลืองเป็นประจำ',
      gradeE_min: 1,
      gradeE_max: 1
    },
    {
      templateId: generalTemplate.id,
      title: 'ทัศนคติในการทำงาน',
      description: 'ทัศนคติต่องานและบริษัท',
      maxScore: 10,
      weight: 10,
      order: 9,
      gradeA_desc: 'มีทัศนคติดีเยี่ยม กระตือรือร้น และมีความสุขในการทำงาน',
      gradeA_min: 9,
      gradeA_max: 10,
      gradeB_desc: 'มีทัศนคติดี และกระตือรือร้นในการทำงาน',
      gradeB_min: 7,
      gradeB_max: 8,
      gradeC_desc: 'มีทัศนคติปานกลาง ทำงานตามหน้าที่',
      gradeC_min: 5,
      gradeC_max: 6,
      gradeD_desc: 'มีทัศนคติไม่ค่อยดี บ่นบ่อย',
      gradeD_min: 3,
      gradeD_max: 4,
      gradeE_desc: 'มีทัศนคติไม่ดี ไม่พอใจเป็นประจำ',
      gradeE_min: 1,
      gradeE_max: 2
    }
  ];
  
  // บันทึกหัวข้อประเมินสำหรับพนักงานรายวันทั่วไป
  for (const itemData of generalItems) {
    const item = await prisma.evaluationItem.create({
      data: itemData
    });
    console.log(`Created general staff evaluation item: ${item.title}`);
  }
  
  // สร้างตั้งค่าเกรด
  const grades = [
    {
      grade: 'A',
      minScore: 80,
      maxScore: 100,
      description: 'ดีเยี่ยม'
    },
    {
      grade: 'B',
      minScore: 70,
      maxScore: 79.99,
      description: 'ดี'
    },
    {
      grade: 'C',
      minScore: 60,
      maxScore: 69.99,
      description: 'ปานกลาง'
    },
    {
      grade: 'D',
      minScore: 50,
      maxScore: 59.99,
      description: 'พอใช้'
    },
    {
      grade: 'F',
      minScore: 0,
      maxScore: 49.99,
      description: 'ต้องปรับปรุง'
    }
  ];
  
  // บันทึกตั้งค่าเกรด
  for (const gradeData of grades) {
    const grade = await prisma.gradeRule.create({
      data: gradeData
    });
    console.log(`Created grade rule: ${grade.grade} (${grade.minScore}-${grade.maxScore})`);
  }
  
// สร้างตั้งค่าการหักคะแนน
const deductions = [
  {
    type: 'LATE' as AttendanceType,
    points: 0.5,
    maxCount: 5,
    forceGrade: null
  },
  {
    type: 'ABSENT' as AttendanceType,
    points: 2,
    maxCount: 3,
    forceGrade: 'F'
  },
  {
    type: 'SICK_LEAVE' as AttendanceType,
    points: 0.25,
    maxCount: 10,
    forceGrade: null
  },
  {
    type: 'PERSONAL_LEAVE' as AttendanceType,
    points: 0.5,
    maxCount: 5,
    forceGrade: null
  }
];
  
  // บันทึกตั้งค่าการหักคะแนน
  for (const deductionData of deductions) {
    const deduction = await prisma.deductionRule.create({
      data: deductionData
    });
    console.log(`Created deduction rule: ${deduction.type} (${deduction.points} points)`);
  }
  
  console.log('All sample data created successfully');
}

main()
  .catch((e) => {
    console.error('Error in seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });