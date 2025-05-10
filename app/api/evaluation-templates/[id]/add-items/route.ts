import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/app/lib/utils';

const prisma = new PrismaClient();

// POST: เพิ่มหัวข้อประเมินที่มีอยู่แล้วลงในแบบฟอร์ม
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const templateId = context.params.id;
    
    // ตรวจสอบสิทธิ์การเข้าถึง
    const token = request.headers.get('Cookie')?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'ADMIN_HR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const data = await request.json();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ 
        error: 'กรุณาระบุรายการหัวข้อประเมินที่ต้องการเพิ่ม' 
      }, { status: 400 });
    }
    
    // ตรวจสอบว่าแบบฟอร์มประเมินที่ระบุมีอยู่จริง
    const template = await prisma.evaluationTemplate.findUnique({
      where: { id: templateId }
    });
    
    if (!template) {
      return NextResponse.json({ error: 'ไม่พบแบบฟอร์มประเมินที่ระบุ' }, { status: 404 });
    }
    
    // ดึงหัวข้อประเมินที่มีอยู่ในแบบฟอร์มแล้ว
    const existingItems = await prisma.evaluationItem.findMany({
      where: { templateId }
    });
    
    // ค้นหาลำดับสูงสุดที่มีอยู่
    const maxOrder = existingItems.length > 0 
      ? Math.max(...existingItems.map(item => item.order))
      : 0;
    
    // สร้างคัดลอกหัวข้อประเมินเพื่อเพิ่มลงในแบบฟอร์ม
    const itemIds = data.items.map((item: any) => item.itemId);
    
    // ดึงข้อมูลหัวข้อประเมินต้นฉบับ
    const originalItems = await prisma.evaluationItem.findMany({
      where: { id: { in: itemIds } }
    });
    
    // สร้างข้อมูลหัวข้อประเมินใหม่โดยคัดลอกจากต้นฉบับ แต่เปลี่ยน templateId
    const addedItems = [];
    let currentOrder = maxOrder;
    
    for (const item of originalItems) {
      currentOrder += 1;
      
      const newItem = await prisma.evaluationItem.create({
        data: {
          templateId: templateId,
          title: item.title,
          description: item.description,
          maxScore: item.maxScore,
          weight: item.weight,
          order: currentOrder,
          gradeA_desc: item.gradeA_desc,
          gradeA_min: item.gradeA_min,
          gradeA_max: item.gradeA_max,
          gradeB_desc: item.gradeB_desc,
          gradeB_min: item.gradeB_min,
          gradeB_max: item.gradeB_max,
          gradeC_desc: item.gradeC_desc,
          gradeC_min: item.gradeC_min,
          gradeC_max: item.gradeC_max,
          gradeD_desc: item.gradeD_desc,
          gradeD_min: item.gradeD_min,
          gradeD_max: item.gradeD_max,
          gradeE_desc: item.gradeE_desc,
          gradeE_min: item.gradeE_min,
          gradeE_max: item.gradeE_max
        }
      });
      
      addedItems.push(newItem);
    }
    
    return NextResponse.json({
      message: `เพิ่มหัวข้อประเมินจำนวน ${addedItems.length} รายการสำเร็จ`,
      addedItems
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding evaluation items:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}