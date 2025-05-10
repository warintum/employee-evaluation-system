import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/app/lib/utils';

const prisma = new PrismaClient();

// GET: ดึงข้อมูลแบบฟอร์มประเมินทั้งหมด
export async function GET(request: Request) {
  try {
    // ตรวจสอบสิทธิ์การเข้าถึง
    const token = request.headers.get('Cookie')?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'ADMIN_HR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // ดึงข้อมูลแบบฟอร์มประเมินพร้อมจำนวนหัวข้อประเมิน
    const templates = await prisma.evaluationTemplate.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // หาจำนวนหัวข้อประเมินสำหรับแต่ละแบบฟอร์ม
    const templatesWithItemCount = await Promise.all(
      templates.map(async (template) => {
        const itemCount = await prisma.evaluationItem.count({
          where: { templateId: template.id }
        });
        
        return { 
          ...template, 
          itemCount 
        };
      })
    );
    
    return NextResponse.json(templatesWithItemCount);
  } catch (error) {
    console.error('Error fetching evaluation templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST: สร้างแบบฟอร์มประเมินใหม่
export async function POST(request: Request) {
  try {
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
    if (!data.name || !data.position || !data.maxScore) {
      return NextResponse.json({ 
        error: 'กรุณากรอกข้อมูลที่จำเป็น: ชื่อแบบฟอร์ม, ตำแหน่ง, และคะแนนเต็ม' 
      }, { status: 400 });
    }
    
    // สร้างแบบฟอร์มประเมินใหม่
    const newTemplate = await prisma.evaluationTemplate.create({
      data: {
        name: data.name,
        description: data.description || null,
        position: data.position,
        maxScore: parseInt(data.maxScore),
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });
    
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating evaluation template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}