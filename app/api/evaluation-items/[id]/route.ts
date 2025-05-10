import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/app/lib/utils';

const prisma = new PrismaClient();

// GET: ดึงข้อมูลหัวข้อประเมินตาม ID
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    
    // ตรวจสอบสิทธิ์การเข้าถึง
    const token = request.headers.get('Cookie')?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'ADMIN_HR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // ดึงข้อมูลหัวข้อประเมิน
    const item = await prisma.evaluationItem.findUnique({
      where: { id },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            position: true,
            maxScore: true
          }
        }
      }
    });
    
    if (!item) {
      return NextResponse.json({ error: 'หัวข้อประเมินไม่พบ' }, { status: 404 });
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching evaluation item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH: อัปเดตข้อมูลหัวข้อประเมิน
export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    
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
    
    // อัปเดตหัวข้อประเมิน
    const updatedItem = await prisma.evaluationItem.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        description: data.description !== undefined ? data.description : undefined,
        maxScore: data.maxScore !== undefined ? parseInt(data.maxScore) : undefined,
        weight: data.weight !== undefined ? parseInt(data.weight) : undefined,
        order: data.order !== undefined ? parseInt(data.order) : undefined,
        gradeA_desc: data.gradeA_desc !== undefined ? data.gradeA_desc : undefined,
        gradeA_min: data.gradeA_min !== undefined ? parseInt(data.gradeA_min) : undefined,
        gradeA_max: data.gradeA_max !== undefined ? parseInt(data.gradeA_max) : undefined,
        gradeB_desc: data.gradeB_desc !== undefined ? data.gradeB_desc : undefined,
        gradeB_min: data.gradeB_min !== undefined ? parseInt(data.gradeB_min) : undefined,
        gradeB_max: data.gradeB_max !== undefined ? parseInt(data.gradeB_max) : undefined,
        gradeC_desc: data.gradeC_desc !== undefined ? data.gradeC_desc : undefined,
        gradeC_min: data.gradeC_min !== undefined ? parseInt(data.gradeC_min) : undefined,
        gradeC_max: data.gradeC_max !== undefined ? parseInt(data.gradeC_max) : undefined,
        gradeD_desc: data.gradeD_desc !== undefined ? data.gradeD_desc : undefined,
        gradeD_min: data.gradeD_min !== undefined ? parseInt(data.gradeD_min) : undefined,
        gradeD_max: data.gradeD_max !== undefined ? parseInt(data.gradeD_max) : undefined,
        gradeE_desc: data.gradeE_desc !== undefined ? data.gradeE_desc : undefined,
        gradeE_min: data.gradeE_min !== undefined ? parseInt(data.gradeE_min) : undefined,
        gradeE_max: data.gradeE_max !== undefined ? parseInt(data.gradeE_max) : undefined
      }
    });
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating evaluation item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: ลบหัวข้อประเมิน
export async function DELETE(
    request: Request,
    context: { params: { id: string } }
  ) {
    try {
      const id = context.params.id;
      
      // ตรวจสอบสิทธิ์การเข้าถึง
      const token = request.headers.get('Cookie')?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const decoded = await verifyToken(token);
      if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'ADMIN_HR')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      // ตรวจสอบว่ามีคำตอบที่ใช้หัวข้อนี้หรือไม่
      const answersCount = await prisma.itemAnswer.count({
        where: { evaluationItemId: id }
      });
      
      if (answersCount > 0) {
        return NextResponse.json({ 
          error: 'ไม่สามารถลบหัวข้อประเมินนี้ได้ เนื่องจากมีคำตอบสำหรับหัวข้อนี้อยู่' 
        }, { status: 400 });
      }
      
      // ลบหัวข้อประเมิน
      await prisma.evaluationItem.delete({
        where: { id }
      });
      
      return NextResponse.json({ message: 'ลบหัวข้อประเมินสำเร็จ' });
    } catch (error) {
      console.error('Error deleting evaluation item:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }