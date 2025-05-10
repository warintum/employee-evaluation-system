// ไฟล์ app/api/evaluation-templates/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/app/lib/utils';

const prisma = new PrismaClient();

// GET: ดึงข้อมูลแบบฟอร์มประเมินตาม ID
export async function GET(
  request: Request,
  { params }: { params: { id: Promise<string> } }
) {
  try {
    // รอให้ params.id พร้อมใช้งาน
    // eslint-disable-next-line
    const id = await params.id;
    
    // ตรวจสอบสิทธิ์การเข้าถึง
    const token = request.headers.get('Cookie')?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'ADMIN_HR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // ดึงข้อมูลแบบฟอร์มประเมิน
    const template = await prisma.evaluationTemplate.findUnique({
      where: { id },
      include: {
        evaluationItems: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    
    if (!template) {
      return NextResponse.json({ error: 'แบบฟอร์มประเมินไม่พบ' }, { status: 404 });
    }
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching evaluation template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH: อัปเดตข้อมูลแบบฟอร์มประเมิน
export async function PATCH(
  request: Request,
  { params }: { params: { id: Promise<string> } }
) {
  try {
    // รอให้ params.id พร้อมใช้งาน
    const id = await params.id;
    
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
    
    // อัปเดตแบบฟอร์มประเมิน
    const updatedTemplate = await prisma.evaluationTemplate.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        description: data.description !== undefined ? data.description : undefined,
        position: data.position !== undefined ? data.position : undefined,
        maxScore: data.maxScore !== undefined ? parseInt(data.maxScore) : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined
      }
    });
    
    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating evaluation template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: ลบแบบฟอร์มประเมิน
export async function DELETE(
  request: Request,
  { params }: { params: { id: Promise<string> } }
) {
  try {
    // รอให้ params.id พร้อมใช้งาน
    const id = await params.id;
    
    // ตรวจสอบสิทธิ์การเข้าถึง
    const token = request.headers.get('Cookie')?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'ADMIN_HR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // ตรวจสอบว่ามีหัวข้อประเมินที่ใช้แบบฟอร์มนี้หรือไม่
    const itemsCount = await prisma.evaluationItem.count({
      where: { templateId: id }
    });
    
    if (itemsCount > 0) {
      return NextResponse.json({ 
        error: 'ไม่สามารถลบแบบฟอร์มประเมินนี้ได้ เนื่องจากมีหัวข้อประเมินที่ใช้แบบฟอร์มนี้อยู่' 
      }, { status: 400 });
    }
    
    // ตรวจสอบว่ามีการประเมินที่ใช้แบบฟอร์มนี้หรือไม่
    const evaluationsCount = await prisma.evaluation.count({
      where: { templateId: id }
    });
    
    if (evaluationsCount > 0) {
      return NextResponse.json({ 
        error: 'ไม่สามารถลบแบบฟอร์มประเมินนี้ได้ เนื่องจากมีการประเมินที่ใช้แบบฟอร์มนี้อยู่' 
      }, { status: 400 });
    }
    
    // ลบแบบฟอร์มประเมิน
    await prisma.evaluationTemplate.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'ลบแบบฟอร์มประเมินสำเร็จ' });
  } catch (error) {
    console.error('Error deleting evaluation template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}