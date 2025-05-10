import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  
  console.log(`Request to /api/evaluation-templates/${id}`, { 
    method: req.method, 
    body: req.body 
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
    // GET: ดึงข้อมูลตาม ID
    if (req.method === 'GET') {
      console.log(`Fetching template with ID: ${id}`);
      
      const template = await prisma.evaluationTemplate.findUnique({
        where: { id },
        include: { 
          evaluationItems: {
            orderBy: { order: 'asc' }
          }
        }
      });
      
      if (!template) {
        console.log(`Template with ID ${id} not found`);
        return res.status(404).json({ error: 'Template not found' });
      }
      
      console.log('Template found:', template.name);
      return res.status(200).json(template);
    }
    
    // PUT: อัปเดตข้อมูล
    if (req.method === 'PUT') {
      const { name, description, position, maxScore, isActive } = req.body;
      
      console.log(`Updating template with ID: ${id}`, { 
        name, description, position, maxScore, isActive 
      });
      
      if (!name || !position) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'Name and position are required' });
      }
      
      const template = await prisma.evaluationTemplate.update({
        where: { id },
        data: {
          name,
          description,
          position,
          maxScore,
          isActive
        }
      });
      
      console.log('Template updated successfully');
      return res.status(200).json(template);
    }
    
    // DELETE: ลบข้อมูล
    if (req.method === 'DELETE') {
      console.log(`Deleting template with ID: ${id}`);
      
      // ตรวจสอบว่ามีการประเมินที่ใช้แบบฟอร์มนี้หรือไม่
      const relatedEvaluations = await prisma.evaluation.count({
        where: { templateId: id }
      });
      
      if (relatedEvaluations > 0) {
        console.log(`Cannot delete: Template is used in ${relatedEvaluations} evaluations`);
        return res.status(400).json({ 
          error: 'Cannot delete this template as it is being used in evaluations' 
        });
      }
      
      // ลบหัวข้อการประเมินก่อน
      await prisma.evaluationItem.deleteMany({
        where: { templateId: id }
      });
      
      // ลบแบบฟอร์ม
      await prisma.evaluationTemplate.delete({
        where: { id }
      });
      
      console.log('Template and related items deleted successfully');
      return res.status(200).json({ message: 'Template deleted successfully' });
    }
    
    // Method not allowed
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(`Error in evaluation template ${id} API:`, error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}