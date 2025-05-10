import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log('Request to /api/evaluation-templates', { 
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
    // GET: ดึงข้อมูลทั้งหมด
    if (req.method === 'GET') {
      console.log('Fetching all evaluation templates');
      
      const templates = await prisma.evaluationTemplate.findMany({
        include: { evaluationItems: true },
        orderBy: { updatedAt: 'desc' }
      });
      
      console.log(`Found ${templates.length} templates`);
      return res.status(200).json(templates);
    }
    
    // POST: สร้างข้อมูลใหม่
    if (req.method === 'POST') {
      const { name, description, position, maxScore = 100, isActive = true } = req.body;
      
      console.log('Creating new template:', { 
        name, description, position, maxScore, isActive 
      });
      
      if (!name || !position) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'Name and position are required' });
      }
      
      const template = await prisma.evaluationTemplate.create({
        data: {
          name,
          description,
          position,
          maxScore,
          isActive
        }
      });
      
      console.log('Template created successfully:', template);
      return res.status(201).json(template);
    }
    
    // Method not allowed
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in evaluation templates API:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}