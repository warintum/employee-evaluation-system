import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { PlusIcon, EditIcon, DeleteIcon, ArrowUpIcon, ArrowDownIcon } from '@/components/icons';
import toast from 'react-hot-toast';

export default function EvaluationTemplateDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  
  const [template, setTemplate] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteItemModal, setDeleteItemModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    maxScore: 10,
    weight: 10,
    order: 0,
    gradeA_desc: 'ดีเยี่ยม',
    gradeA_min: 8,
    gradeA_max: 10,
    gradeB_desc: 'ดี',
    gradeB_min: 6,
    gradeB_max: 7,
    gradeC_desc: 'ปานกลาง',
    gradeC_min: 4,
    gradeC_max: 5,
    gradeD_desc: 'พอใช้',
    gradeD_min: 2,
    gradeD_max: 3,
    gradeE_desc: 'ต้องปรับปรุง',
    gradeE_min: 0,
    gradeE_max: 1
  });

  // ดึงข้อมูลแบบฟอร์มและหัวข้อประเมิน
  useEffect(() => {
    if (id && status === 'authenticated') {
      fetchTemplateData();
    }
  }, [id, status]);

  const fetchTemplateData = async () => {
    try {
      setLoading(true);
      console.log(`Fetching template data for ID: ${id}`);
      
      const response = await fetch(`/api/evaluation-templates/${id}`);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error fetching template:', error);
        toast.error('Failed to fetch template data');
        return;
      }
      
      const data = await response.json();
      console.log('Template data received:', data);
      
      setTemplate(data);
      
      // จัดเรียงหัวข้อตามลำดับ
      const sortedItems = [...(data.evaluationItems || [])].sort((a, b) => a.order - b.order);
      console.log('Sorted evaluation items:', sortedItems);
      
      setItems(sortedItems);
    } catch (error) {
      console.error('Exception in fetchTemplateData:', error);
      toast.error('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  // เปิดกล่องยืนยันการลบหัวข้อประเมิน
  const confirmDeleteItem = (item) => {
    console.log('Opening delete confirmation for item:', item.title);
    setItemToDelete(item);
    setDeleteItemModal(true);
  };

  // ลบหัวข้อประเมิน
  const deleteItem = async () => {
    if (!itemToDelete) return;
    
    console.log(`Deleting item: ${itemToDelete.id} - ${itemToDelete.title}`);
    
    try {
      const response = await fetch(`/api/evaluation-items/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error deleting item:', data);
        toast.error(data.error || 'Failed to delete item');
        return;
      }
      
      console.log('Item deleted successfully');
      toast.success('Item deleted successfully');
      fetchTemplateData();
    } catch (error) {
      console.error('Exception in deleteItem:', error);
      toast.error('An error occurred while deleting the item');
    } finally {
      setDeleteItemModal(false);
      setItemToDelete(null);
    }
  };

  // เพิ่มหัวข้อประเมินใหม่
  const addNewItem = async (e) => {
    e.preventDefault();
    console.log('Adding new evaluation item:', newItem);
    
    try {
      // เพิ่ม templateId และคำนวณ order
      const itemData = {
        ...newItem,
        templateId: id,
        order: items.length > 0 ? Math.max(...items.map(item => item.order)) + 1 : 1
      };
      
      console.log('Final item data to submit:', itemData);
      
      const response = await fetch('/api/evaluation-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error creating item:', data);
        toast.error(data.error || 'Failed to create item');
        return;
      }
      
      console.log('Item created successfully:', data);
      toast.success('หัวข้อประเมินถูกเพิ่มเรียบร้อยแล้ว');
      
      // รีเซ็ตฟอร์มและซ่อน
      setNewItem({
        title: '',
        description: '',
        maxScore: 10,
        weight: 10,
        order: 0,
        gradeA_desc: 'ดีเยี่ยม',
        gradeA_min: 8,
        gradeA_max: 10,
        gradeB_desc: 'ดี',
        gradeB_min: 6,
        gradeB_max: 7,
        gradeC_desc: 'ปานกลาง',
        gradeC_min: 4,
        gradeC_max: 5,
        gradeD_desc: 'พอใช้',
        gradeD_min: 2,
        gradeD_max: 3,
        gradeE_desc: 'ต้องปรับปรุง',
        gradeE_min: 0,
        gradeE_max: 1
      });
      setShowNewItemForm(false);
      
      // โหลดข้อมูลใหม่
      fetchTemplateData();
    } catch (error) {
      console.error('Exception in addNewItem:', error);
      toast.error('เกิดข้อผิดพลาดในการเพิ่มหัวข้อประเมิน');
    }
  };

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์มเพิ่มหัวข้อ
  const handleNewItemChange = (e) => {
    const { name, value, type } = e.target;
    console.log(`Field '${name}' changed:`, value);
    
    setNewItem(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  // เปลี่ยนลำดับหัวข้อ (เลื่อนขึ้น)
  const moveItemUp = async (index) => {
    if (index <= 0) return;
    
    console.log(`Moving item ${items[index].title} up`);
    
    const newItems = [...items];
    [newItems[index].order, newItems[index - 1].order] = [newItems[index - 1].order, newItems[index].order];
    
    try {
      const response = await fetch('/api/evaluation-items/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: [newItems[index], newItems[index - 1]] }),
      });
      
      if (!response.ok) {
        console.error('Error reordering items');
        toast.error('Failed to reorder items');
        return;
      }
      
      console.log('Items reordered successfully');
      fetchTemplateData();
    } catch (error) {
      console.error('Exception in moveItemUp:', error);
      toast.error('An error occurred while reordering items');
    }
  };

  // เปลี่ยนลำดับหัวข้อ (เลื่อนลง)
  const moveItemDown = async (index) => {
    if (index >= items.length - 1) return;
    
    console.log(`Moving item ${items[index].title} down`);
    
    const newItems = [...items];
    [newItems[index].order, newItems[index + 1].order] = [newItems[index + 1].order, newItems[index].order];
    
    try {
      const response = await fetch('/api/evaluation-items/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: [newItems[index], newItems[index + 1]] }),
      });
      
      if (!response.ok) {
        console.error('Error reordering items');
        toast.error('Failed to reorder items');
        return;
      }
      
      console.log('Items reordered successfully');
      fetchTemplateData();
    } catch (error) {
      console.error('Exception in moveItemDown:', error);
      toast.error('An error occurred while reordering items');
    }
  };

  // ตรวจสอบการเข้าสู่ระบบและสิทธิ์
  if (status === 'loading' || !id) {
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
        {loading ? (
          <div className="text-center p-8">กำลังโหลดข้อมูล...</div>
        ) : !template ? (
          <div className="text-center p-8">
            <p className="text-red-500">ไม่พบข้อมูลแบบฟอร์มประเมิน</p>
            <button
              onClick={() => router.push('/admin/evaluation-templates')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              กลับไปหน้ารายการแบบฟอร์ม
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">{template.name}</h1>
                <p className="text-gray-600">
                  ตำแหน่ง: {template.position} | คะแนนเต็ม: {template.maxScore}
                </p>
                {template.description && (
                  <p className="text-gray-600 mt-2">{template.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/admin/evaluation-templates/edit/${id}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <EditIcon className="mr-2" />
                  แก้ไขแบบฟอร์ม
                </button>
                <button
                  onClick={() => router.push('/admin/evaluation-templates')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                >
                  กลับ
                </button>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">หัวข้อการประเมิน</h2>
                <button
                  onClick={() => setShowNewItemForm(!showNewItemForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <PlusIcon className="mr-2" />
                  {showNewItemForm ? 'ซ่อนฟอร์ม' : 'เพิ่มหัวข้อ'}
                </button>
              </div>

              {showNewItemForm && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">เพิ่มหัวข้อประเมินใหม่</h3>
                  <form onSubmit={addNewItem}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ชื่อหัวข้อ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={newItem.title}
                          onChange={handleNewItemChange}
                          required
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          placeholder="เช่น ปริมาณงาน"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          คำอธิบาย
                        </label>
                        <input
                          type="text"
                          name="description"
                          value={newItem.description}
                          onChange={handleNewItemChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                          placeholder="คำอธิบายเพิ่มเติม"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          คะแนนเต็ม <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="maxScore"
                          value={newItem.maxScore}
                          onChange={handleNewItemChange}
                          required
                          min="1"
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          น้ำหนักคะแนน (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={newItem.weight}
                          onChange={handleNewItemChange}
                          required
                          min="1"
                          max="100"
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    <h4 className="font-medium mb-2 mt-4">เกณฑ์การให้คะแนน</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                      <div className="bg-green-50 p-2 rounded">
                        <p className="font-medium text-green-800">เกรด A</p>
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                          <input
                            type="text"
                            name="gradeA_desc"
                            value={newItem.gradeA_desc}
                            onChange={handleNewItemChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">คะแนนต่ำสุด</label>
                            <input
                              type="number"
                              name="gradeA_min"
                              value={newItem.gradeA_min}
                              onChange={handleNewItemChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">คะแนนสูงสุด</label>
                            <input
                              type="number"
                              name="gradeA_max"
                              value={newItem.gradeA_max}
                              onChange={handleNewItemChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-2 rounded">
                        <p className="font-medium text-blue-800">เกรด B</p>
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                          <input
                            type="text"
                            name="gradeB_desc"
                            value={newItem.gradeB_desc}
                            onChange={handleNewItemChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">คะแนนต่ำสุด</label>
                            <input
                              type="number"
                              name="gradeB_min"
                              value={newItem.gradeB_min}
                              onChange={handleNewItemChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">คะแนนสูงสุด</label>
                            <input
                              type="number"
                              name="gradeB_max"
                              value={newItem.gradeB_max}
                              onChange={handleNewItemChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-2 rounded">
                        <p className="font-medium text-yellow-800">เกรด C</p>
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                          <input
                            type="text"
                            name="gradeC_desc"
                            value={newItem.gradeC_desc}
                            onChange={handleNewItemChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">คะแนนต่ำสุด</label>
                            <input
                              type="number"
                              name="gradeC_min"
                              value={newItem.gradeC_min}
                              onChange={handleNewItemChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">คะแนนสูงสุด</label>
                            <input
                              type="number"
                              name="gradeC_max"
                              value={newItem.gradeC_max}
                              onChange={handleNewItemChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 p-2 rounded">
                        <p className="font-medium text-orange-800">เกรด D</p>
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                          <input
                            type="text"
                            name="gradeD_desc"
                            value={newItem.gradeD_desc}
                            onChange={handleNewItemChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">คะแนนต่ำสุด</label>
                            <input
                              type="number"
                              name="gradeD_min"
                              value={newItem.gradeD_min}
                              onChange={handleNewItemChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">คะแนนสูงสุด</label>
                            <input
                              type="number"
                              name="gradeD_max"
                              value={newItem.gradeD_max}
                              onChange={handleNewItemChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 p-2 rounded">
                        <p className="font-medium text-red-800">เกรด E</p>
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                          <input
                            type="text"
                            name="gradeE_desc"
                            value={newItem.gradeE_desc}
                            onChange={handleNewItemChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">คะแนนต่ำสุด</label>
                            <input
                              type="number"
                              name="gradeE_min"
                              value={newItem.gradeE_min}
                              onChange={handleNewItemChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">คะแนนสูงสุด</label>
                            <input
                              type="number"
                              name="gradeE_max"
                              value={newItem.gradeE_max}
                              onChange={handleNewItemChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => setShowNewItemForm(false)}
                        className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        บันทึกหัวข้อ
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {items.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">ยังไม่มีหัวข้อการประเมินในแบบฟอร์มนี้</p>
                  <button
                    onClick={() => setShowNewItemForm(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    เพิ่มหัวข้อประเมินใหม่
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden shadow-sm border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ลำดับ
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          หัวข้อประเมิน
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          คะแนนเต็ม
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          น้ำหนัก (%)
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          เกณฑ์การให้คะแนน
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          จัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col items-center">
                              <span className="font-medium">{index + 1}</span>
                              <div className="flex space-x-1 mt-1">
                                <button
                                  onClick={() => moveItemUp(index)}
                                  disabled={index === 0}
                                  className={`p-1 rounded ${
                                    index === 0
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-gray-600 hover:bg-gray-200'
                                  }`}
                                  title="เลื่อนขึ้น"
                                >
                                  <ArrowUpIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => moveItemDown(index)}
                                  disabled={index === items.length - 1}
                                  className={`p-1 rounded ${
                                    index === items.length - 1
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-gray-600 hover:bg-gray-200'
                                  }`}
                                  title="เลื่อนลง"
                                >
                                  <ArrowDownIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-900">
                            <div className="font-medium">{item.title}</div>
                            {item.description && (
                              <div className="text-xs text-gray-500">{item.description}</div>
                            )}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-medium">
                            {item.maxScore}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                            {item.weight}%
                          </td>
                          <td className="px-3 py-3 text-sm">
                            <div className="text-xs grid grid-cols-1 gap-1">
                              <div className="bg-green-50 p-1 rounded flex">
                                <span className="font-medium text-green-800 mr-1">A:</span>
                                <span className="text-gray-700">
                                  {item.gradeA_min}-{item.gradeA_max} คะแนน ({item.gradeA_desc})
                                </span>
                              </div>
                              <div className="bg-blue-50 p-1 rounded flex">
                                <span className="font-medium text-blue-800 mr-1">B:</span>
                                <span className="text-gray-700">
                                  {item.gradeB_min}-{item.gradeB_max} คะแนน ({item.gradeB_desc})
                                </span>
                              </div>
                              <div className="bg-yellow-50 p-1 rounded flex">
                                <span className="font-medium text-yellow-800 mr-1">C:</span>
                                <span className="text-gray-700">
                                  {item.gradeC_min}-{item.gradeC_max} คะแนน ({item.gradeC_desc})
                                </span>
                              </div>
                              <div className="bg-orange-50 p-1 rounded flex">
                                <span className="font-medium text-orange-800 mr-1">D:</span>
                                <span className="text-gray-700">
                                  {item.gradeD_min}-{item.gradeD_max} คะแนน ({item.gradeD_desc})
                                </span>
                              </div>
                              <div className="bg-red-50 p-1 rounded flex">
                                <span className="font-medium text-red-800 mr-1">E:</span>
                                <span className="text-gray-700">
                                  {item.gradeE_min}-{item.gradeE_max} คะแนน ({item.gradeE_desc})
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => router.push(`/admin/evaluation-items/edit/${item.id}`)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                              title="แก้ไขหัวข้อ"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => confirmDeleteItem(item)}
                              className="text-red-600 hover:text-red-900"
                              title="ลบหัวข้อ"
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
          </>
        )}
      </div>

      {/* Modal ยืนยันการลบหัวข้อประเมิน */}
      <Modal
        isOpen={deleteItemModal}
        onClose={() => {
          setDeleteItemModal(false);
          setItemToDelete(null);
        }}
        title="ยืนยันการลบหัวข้อประเมิน"
      >
        <div className="p-6">
          <p className="mb-4">
            คุณต้องการลบหัวข้อประเมิน "{itemToDelete?.title}" ใช่หรือไม่?
          </p>
          <p className="mb-4 text-yellow-600">
            <strong>คำเตือน:</strong> การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </p>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setDeleteItemModal(false);
                setItemToDelete(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              ยกเลิก
            </button>
            <button
              onClick={deleteItem}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              ลบหัวข้อ
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}