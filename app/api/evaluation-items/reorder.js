import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log('Request to /api/evaluation-items/reorder', { 
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

  // ตรวจสอบว่าเป็น POST method หรือไม่
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items } = req.body;
  
  if (!items || !Array.isArray(items)) {
    console.log('Invalid input: items must be an array');
    return res.status(400).json({ error: 'Items must be an array' });
  }

  try {
    console.log(`Reordering ${items.length} items`);
    
    const updatePromises = items.map((item, index) => {
      console.log(`Setting item ${item.id} to order ${index + 1}`);
      return prisma.evaluationItem.update({
        where: { id: item.id },
        data: { order: index + 1 }
      });
    });
    
    await Promise.all(updatePromises);
    
    console.log('Reordering completed successfully');
    return res.status(200).json({ message: 'Items reordered successfully' });
  } catch (error) {
    console.error('Error in reordering items:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}