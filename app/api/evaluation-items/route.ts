import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/app/lib/utils';

const prisma = new PrismaClient();

// GET: ดึงข้อมูลหัวข้อประเมินทั้งหมดหรือตาม templateId
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
    
    // ดึง URL parameters
    const url = new URL(request.url);
    const templateId = url.searchParams.get('templateId');
    
    // สร้างเงื่อนไขการค้นหา
    const where = templateId ? { templateId } : {};
    
    // ดึงข้อมูลหัวข้อประเมิน
    const items = await prisma.evaluationItem.findMany({
      where,
      orderBy: {
        order: 'asc'
      },
      include: {
        template: {
          select: {
            name: true,
            position: true
          }
        }
      }
    });
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching evaluation items:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST: สร้างหัวข้อประเมินใหม่
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
    if (!data.templateId || !data.title || data.weight === undefined || data.maxScore === undefined) {
      return NextResponse.json({ 
        error: 'กรุณากรอกข้อมูลที่จำเป็น: templateId, title, weight, maxScore' 
      }, { status: 400 });
    }
    
    // ตรวจสอบว่าแบบฟอร์มประเมินที่ระบุมีอยู่จริง
    const template = await prisma.evaluationTemplate.findUnique({
      where: { id: data.templateId }
    });
    
    if (!template) {
      return NextResponse.json({ error: 'ไม่พบแบบฟอร์มประเมินที่ระบุ' }, { status: 404 });
    }
    
    // สร้างหัวข้อประเมินใหม่
    const newItem = await prisma.evaluationItem.create({
      data: {
        templateId: data.templateId,
        title: data.title,
        description: data.description || null,
        maxScore: parseInt(data.maxScore),
        weight: parseInt(data.weight),
        order: parseInt(data.order),
        gradeA_desc: data.gradeA_desc,
        gradeA_min: parseInt(data.gradeA_min),
        gradeA_max: parseInt(data.gradeA_max),
        gradeB_desc: data.gradeB_desc,
        gradeB_min: parseInt(data.gradeB_min),
        gradeB_max: parseInt(data.gradeB_max),
        gradeC_desc: data.gradeC_desc,
        gradeC_min: parseInt(data.gradeC_min),
        gradeC_max: parseInt(data.gradeC_max),
        gradeD_desc: data.gradeD_desc,
        gradeD_min: parseInt(data.gradeD_min),
        gradeD_max: parseInt(data.gradeD_max),
        gradeE_desc: data.gradeE_desc,
        gradeE_min: parseInt(data.gradeE_min),
        gradeE_max: parseInt(data.gradeE_max)
      }
    });
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating evaluation item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}