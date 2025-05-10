import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PlusIcon, EditIcon, DeleteIcon, ViewIcon } from '@/components/icons';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function EvaluationTemplates() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  // ดึงข้อมูลแบบฟอร์มประเมินทั้งหมด
  useEffect(() => {
    console.log('Fetching evaluation templates...');
    
    if (status === 'authenticated') {
      fetchTemplates();
    }
  }, [status]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      console.log('Sending GET request to /api/evaluation-templates');
      
      const response = await fetch('/api/evaluation-templates');
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error fetching templates:', error);
        toast.error('Failed to fetch templates');
        return;
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} templates:`, data);
      setTemplates(data);
    } catch (error) {
      console.error('Exception in fetchTemplates:', error);
      toast.error('An error occurred while fetching templates');
    } finally {
      setLoading(false);
    }
  };

  // เปิดกล่องยืนยันการลบ
  const confirmDelete = (template) => {
    console.log('Opening delete confirmation for template:', template.name);
    setTemplateToDelete(template);
    setDeleteModal(true);
  };

  // ลบแบบฟอร์มประเมิน
  const deleteTemplate = async () => {
    if (!templateToDelete) return;
    
    console.log(`Deleting template: ${templateToDelete.id} - ${templateToDelete.name}`);
    
    try {
      const response = await fetch(`/api/evaluation-templates/${templateToDelete.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error deleting template:', data);
        toast.error(data.error || 'Failed to delete template');
        return;
      }
      
      console.log('Template deleted successfully');
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Exception in deleteTemplate:', error);
      toast.error('An error occurred while deleting the template');
    } finally {
      setDeleteModal(false);
      setTemplateToDelete(null);
    }
  };

  // Check if user is authenticated and has admin privileges
  if (status === 'loading') {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'ADMIN_HR') {
    return (
      <Layout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-4">You do not have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">แบบฟอร์มประเมิน</h1>
          <button
            onClick={() => router.push('/admin/evaluation-templates/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <PlusIcon className="mr-2" />
            สร้างแบบฟอร์มใหม่
          </button>
        </div>

        {loading ? (
          <div className="text-center p-8">กำลังโหลดข้อมูล...</div>
        ) : templates.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">ไม่พบข้อมูลแบบฟอร์มประเมิน</p>
            <button
              onClick={() => router.push('/admin/evaluation-templates/create')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              สร้างแบบฟอร์มใหม่
            </button>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อแบบฟอร์ม
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ตำแหน่งงาน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จำนวนหัวข้อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คะแนนเต็ม
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{template.name}</div>
                      {template.description && (
                        <div className="text-sm text-gray-500">{template.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{template.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {template.evaluationItems?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{template.maxScore}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      `}
                      >
                        {template.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/evaluation-templates/${template.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="ดูรายละเอียด"
                      >
                        <ViewIcon />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/evaluation-templates/edit/${template.id}`)}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                        title="แก้ไขแบบฟอร์ม"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => confirmDelete(template)}
                        className="text-red-600 hover:text-red-900"
                        title="ลบแบบฟอร์ม"
                      >
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal ยืนยันการลบ */}
      <Modal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setTemplateToDelete(null);
        }}
        title="ยืนยันการลบแบบฟอร์ม"
      >
        <div className="p-6">
          <p className="mb-4">
            คุณต้องการลบแบบฟอร์ม "{templateToDelete?.name}" ใช่หรือไม่?
          </p>
          <p className="mb-4 text-yellow-600">
            <strong>คำเตือน:</strong> การดำเนินการนี้ไม่สามารถย้อนกลับได้ และจะลบหัวข้อการประเมินที่เกี่ยวข้องทั้งหมด
          </p>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setDeleteModal(false);
                setTemplateToDelete(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              ยกเลิก
            </button>
            <button
              onClick={deleteTemplate}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              ลบแบบฟอร์ม
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}