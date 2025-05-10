import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log('Request to /api/evaluation-items', { 
    method: req.method, 
    body: req.body,
    query: req.query 
  });

  // ตรวจสอบการล็อกอิน
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    console.log('Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // ตรวจสอบสิทธิ์ (เฉพาะ Admin และ Admin_HR เท่านั้น)
  if (session.user.role !== 'ADMIN' && session.user.role !== 'ADMIN_HR') {
    console.log('Access denied for user:', session.user.email, 'Role:', session.user.role);
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }

  try {
    // GET: ดึงข้อมูลทั้งหมด หรือกรองตาม templateId
    if (req.method === 'GET') {
      const { templateId } = req.query;
      
      if (templateId) {
        console.log(`Fetching items for template ID: ${templateId}`);
        
        const items = await prisma.evaluationItem.findMany({
          where: { templateId },
          orderBy: { order: 'asc' }
        });
        
        console.log(`Found ${items.length} items for template ID: ${templateId}`);
        return res.status(200).json(items);
      } else {
        console.log('Fetching all evaluation items');
        
        const items = await prisma.evaluationItem.findMany({
          orderBy: [
            { templateId: 'asc' },
            { order: 'asc' }
          ]
        });
        
        console.log(`Found ${items.length} items total`);
        return res.status(200).json(items);
      }
    }
    
    // POST: สร้างข้อมูลใหม่
    if (req.method === 'POST') {
      const {
        templateId, title, description, maxScore, weight, order,
        gradeA_desc, gradeA_min, gradeA_max,
        gradeB_desc, gradeB_min, gradeB_max,
        gradeC_desc, gradeC_min, gradeC_max,
        gradeD_desc, gradeD_min, gradeD_max,
        gradeE_desc, gradeE_min, gradeE_max
      } = req.body;
      
      console.log('Creating new evaluation item:', { 
        templateId, title, maxScore, weight, order 
      });
      
      if (!templateId || !title || !maxScore || !weight) {
        console.log('Missing required fields');
        return res.status(400).json({ 
          error: 'Template ID, title, max score, and weight are required' 
        });
      }
      
      // ตรวจสอบว่าเป็นแบบฟอร์มที่มีอยู่จริง
      const template = await prisma.evaluationTemplate.findUnique({
        where: { id: templateId }
      });
      
      if (!template) {
        console.log(`Template with ID ${templateId} not found`);
        return res.status(404).json({ error: 'Template not found' });
      }
      
      const item = await prisma.evaluationItem.create({
        data: {
          templateId,
          title,
          description,
          maxScore,
          weight,
          order: order || 0,
          gradeA_desc, gradeA_min, gradeA_max,
          gradeB_desc, gradeB_min, gradeB_max,
          gradeC_desc, gradeC_min, gradeC_max,
          gradeD_desc, gradeD_min, gradeD_max,
          gradeE_desc, gradeE_min, gradeE_max
        }
      });
      
      console.log('Evaluation item created successfully:', item.title);
      return res.status(201).json(item);
    }
    
    // Method not allowed
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in evaluation items API:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}