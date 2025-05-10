import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  
  console.log(`Request to /api/evaluation-items/${id}`, { 
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
      console.log(`Fetching evaluation item with ID: ${id}`);
      
      const item = await prisma.evaluationItem.findUnique({
        where: { id }
      });
      
      if (!item) {
        console.log(`Evaluation item with ID ${id} not found`);
        return res.status(404).json({ error: 'Evaluation item not found' });
      }
      
      console.log('Evaluation item found:', item.title);
      return res.status(200).json(item);
    }
    
    // PUT: อัปเดตข้อมูล
    if (req.method === 'PUT') {
      const {
        title, description, maxScore, weight, order,
        gradeA_desc, gradeA_min, gradeA_max,
        gradeB_desc, gradeB_min, gradeB_max,
        gradeC_desc, gradeC_min, gradeC_max,
        gradeD_desc, gradeD_min, gradeD_max,
        gradeE_desc, gradeE_min, gradeE_max
      } = req.body;
      
      console.log(`Updating evaluation item with ID: ${id}`, { 
        title, maxScore, weight, order 
      });
      
      if (!title || !maxScore || !weight) {
        console.log('Missing required fields');
        return res.status(400).json({ 
          error: 'Title, max score, and weight are required' 
        });
      }
      
      const item = await prisma.evaluationItem.update({
        where: { id },
        data: {
          title,
          description,
          maxScore,
          weight,
          order,
          gradeA_desc, gradeA_min, gradeA_max,
          gradeB_desc, gradeB_min, gradeB_max,
          gradeC_desc, gradeC_min, gradeC_max,
          gradeD_desc, gradeD_min, gradeD_max,
          gradeE_desc, gradeE_min, gradeE_max
        }
      });
      
      console.log('Evaluation item updated successfully');
      return res.status(200).json(item);
    }
    
    // DELETE: ลบข้อมูล
    if (req.method === 'DELETE') {
      console.log(`Deleting evaluation item with ID: ${id}`);
      
      // ตรวจสอบว่ามีการประเมินสำหรับหัวข้อนี้หรือไม่
      const relatedAnswers = await prisma.itemAnswer.count({
        where: { evaluationItemId: id }
      });
      
      if (relatedAnswers > 0) {
        console.log(`Cannot delete: Item is used in ${relatedAnswers} answers`);
        return res.status(400).json({ 
          error: 'Cannot delete this item as it has been used in evaluations' 
        });
      }
      
      await prisma.evaluationItem.delete({
        where: { id }
      });
      
      console.log('Evaluation item deleted successfully');
      return res.status(200).json({ message: 'Evaluation item deleted successfully' });
    }
    
    // Method not allowed
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(`Error in evaluation item ${id} API:`, error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}