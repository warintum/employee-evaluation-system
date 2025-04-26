import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatThaiDate } from '@/app/lib/utils';

// คอมโพเนนต์แสดงข้อมูลการขาด ลา มาสาย
export const AttendanceSummaryCard = ({ attendance }: { attendance: any }) => {
  console.log('แสดงข้อมูลการขาด ลา มาสาย:', attendance);
  
  const getAttendanceIcon = (type: string) => {
    switch (type) {
      case 'ABSENT':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'LATE':
        return (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'SICK_LEAVE':
        return (
          <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'PERSONAL_LEAVE':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        );
      case 'VACATION':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        );
    }
  };
  
  const getAttendanceLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ABSENT': 'ขาดงาน',
      'LATE': 'มาสาย',
      'SICK_LEAVE': 'ลาป่วย',
      'PERSONAL_LEAVE': 'ลากิจ',
      'VACATION': 'ลาพักร้อน',
      'OTHER': 'อื่นๆ'
    };
    
    return labels[type] || type;
  };
  
  const getCardBorderColor = (type: string) => {
    const colors: Record<string, string> = {
      'ABSENT': 'border-red-500',
      'LATE': 'border-yellow-500',
      'SICK_LEAVE': 'border-indigo-500',
      'PERSONAL_LEAVE': 'border-blue-500',
      'VACATION': 'border-green-500',
      'OTHER': 'border-gray-500'
    };
    
    return colors[type] || 'border-gray-300';
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">การลางาน / ขาดงาน / มาสาย ในปี {new Date().getFullYear() + 543}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
        {Object.keys(attendance.summary).map((type) => (
          <div 
            key={type}
            className={`p-4 rounded-lg border-l-4 ${getCardBorderColor(type)} bg-white shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0">
                {getAttendanceIcon(type)}
              </div>
              <div className="ml-3 text-right">
                <div className="text-2xl font-bold">{attendance.summary[type]}</div>
                <div className="text-xs text-gray-500">{getAttendanceLabel(type)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-right">
        <Link href="/profile/attendance" className="text-sm text-blue-600 hover:text-blue-800">
          ดูประวัติการลางานทั้งหมด →
        </Link>
      </div>
    </div>
  );
};

// คอมโพเนนต์แสดงข้อมูลการประเมินปัจจุบัน
export const CurrentEvaluationCard = ({ evaluation }: { evaluation: any }) => {
  console.log('แสดงข้อมูลการประเมินปัจจุบัน:', evaluation);
  
  if (!evaluation) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">การประเมินรอบปัจจุบัน</h2>
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            <p className="mt-4 text-gray-600">ไม่พบการประเมินในรอบปัจจุบัน</p>
          </div>
        </div>
      </div>
    );
  }
  
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-gray-100 text-gray-800',
      'SELF_EVALUATING': 'bg-blue-100 text-blue-800',
      'EVALUATOR_EVALUATING': 'bg-indigo-100 text-indigo-800',
      'REVIEWER_REVIEWING': 'bg-purple-100 text-purple-800',
      'MANAGER_REVIEWING': 'bg-pink-100 text-pink-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'รอดำเนินการ',
      'SELF_EVALUATING': 'กำลังประเมินตนเอง',
      'EVALUATOR_EVALUATING': 'กำลังรอผู้ประเมิน',
      'REVIEWER_REVIEWING': 'กำลังรอผู้ตรวจสอบ',
      'MANAGER_REVIEWING': 'กำลังรอผู้จัดการ',
      'COMPLETED': 'เสร็จสิ้น',
      'REJECTED': 'ถูกปฏิเสธ'
    };
    
    return labels[status] || status;
  };
  
  const getProgressPercentage = (status: string) => {
    const percentages: Record<string, number> = {
      'PENDING': 10,
      'SELF_EVALUATING': 25,
      'EVALUATOR_EVALUATING': 50,
      'REVIEWER_REVIEWING': 75,
      'MANAGER_REVIEWING': 90,
      'COMPLETED': 100,
      'REJECTED': 0
    };
    
    return percentages[status] || 0;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-2">การประเมินรอบปัจจุบัน</h2>
      <p className="text-sm text-gray-500 mb-4">รอบประเมิน {evaluation.period} ปี {evaluation.year + 543}</p>
      
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(evaluation.status)}`}>
              {getStatusLabel(evaluation.status)}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            อัพเดทล่าสุด: {formatThaiDate(new Date(evaluation.updatedAt))}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${getProgressPercentage(evaluation.status)}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-xs text-gray-500 mb-1">ผู้ประเมิน</div>
            <div className="text-sm font-medium">{evaluation.evaluator.firstName} {evaluation.evaluator.lastName}</div>
            <div className="text-xs text-gray-500">{evaluation.evaluator.position}</div>
          </div>
          
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-xs text-gray-500 mb-1">ผู้ตรวจสอบ</div>
            <div className="text-sm font-medium">{evaluation.reviewer.firstName} {evaluation.reviewer.lastName}</div>
            <div className="text-xs text-gray-500">{evaluation.reviewer.position}</div>
          </div>
          
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-xs text-gray-500 mb-1">ผู้อนุมัติ</div>
            <div className="text-sm font-medium">{evaluation.manager.firstName} {evaluation.manager.lastName}</div>
            <div className="text-xs text-gray-500">{evaluation.manager.position}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-right">
        <Link href={`/evaluations/${evaluation.id}`} className="text-sm text-blue-600 hover:text-blue-800">
          ดูรายละเอียดการประเมิน →
        </Link>
      </div>
    </div>
  );
};

// คอมโพเนนต์แสดงข้อมูลผลการประเมินล่าสุด
export const LastEvaluationCard = ({ evaluation }: { evaluation: any }) => {
  console.log('แสดงข้อมูลผลการประเมินล่าสุด:', evaluation);
  
  if (!evaluation) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">ผลการประเมินล่าสุด</h2>
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            <p className="mt-4 text-gray-600">ยังไม่มีผลการประเมิน</p>
          </div>
        </div>
      </div>
    );
  }
  
  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-green-500',
      'B+': 'bg-green-400',
      'B': 'bg-blue-500',
      'C+': 'bg-blue-400',
      'C': 'bg-yellow-500',
      'D+': 'bg-yellow-400',
      'D': 'bg-red-400',
      'F': 'bg-red-500'
    };
    
    return colors[grade] || 'bg-gray-500';
  };
  
  const getGradeDescription = (grade: string) => {
    const descriptions: Record<string, string> = {
      'A': 'ดีเยี่ยม',
      'B+': 'ดีมาก',
      'B': 'ดี',
      'C+': 'ค่อนข้างดี',
      'C': 'พอใช้',
      'D+': 'อ่อน',
      'D': 'อ่อนมาก',
      'F': 'ไม่ผ่าน'
    };
    
    return descriptions[grade] || '';
  };
  
  // แยกคำตอบตามหมวดหมู่
  const getAnswersByCategory = () => {
    if (!evaluation.answers || evaluation.answers.length === 0) {
      return [];
    }
    
    const categoriesMap = new Map();
    
    evaluation.answers.forEach((answer: any) => {
      const category = answer.question.category;
      
      if (!categoriesMap.has(category.id)) {
        categoriesMap.set(category.id, {
          id: category.id,
          name: category.name,
          answers: [],
          averageScore: 0
        });
      }
      
      categoriesMap.get(category.id).answers.push(answer);
    });
    
    // คำนวณคะแนนเฉลี่ยของแต่ละหมวดหมู่
    const categoriesWithAverages = Array.from(categoriesMap.values()).map(category => {
      const totalScore = category.answers.reduce((sum: number, answer: any) => sum + answer.score, 0);
      const averageScore = category.answers.length > 0 ? totalScore / category.answers.length : 0;
      
      return {
        ...category,
        averageScore: parseFloat(averageScore.toFixed(2))
      };
    });
    
    return categoriesWithAverages;
  };
  
  const categories = getAnswersByCategory();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-2">ผลการประเมินล่าสุด</h2>
      <p className="text-sm text-gray-500 mb-4">รอบประเมิน {evaluation.period} ปี {evaluation.year + 543}</p>
      
      <div className="flex flex-col md:flex-row mb-6 gap-6">
        <div className="md:w-1/3 bg-blue-50 rounded-lg p-6 text-center flex flex-col items-center justify-center">
          <div className="text-sm text-gray-500 mb-2">คะแนนรวม</div>
          <div className="text-4xl font-bold mb-1">{evaluation.finalScore?.toFixed(2) || '-'}</div>
          <div className="text-sm text-gray-500 mb-4">คะแนนเต็ม 100</div>
          
          <div className="flex flex-col items-center mt-2">
            <div className="text-sm text-gray-500 mb-2">เกรด</div>
            <div className={`text-white ${getGradeColor(evaluation.finalGrade || '')} w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold`}>
              {evaluation.finalGrade || '-'}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {getGradeDescription(evaluation.finalGrade || '')}
            </div>
          </div>
        </div>
        
        <div className="md:w-2/3">
          <h3 className="text-md font-semibold text-gray-700 mb-4">คะแนนแยกตามหมวดหมู่</h3>
          
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <span className="text-sm font-medium text-gray-700">{category.averageScore}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(category.averageScore / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-right">
        <Link href={`/evaluations/${evaluation.id}`} className="text-sm text-blue-600 hover:text-blue-800">
          ดูรายละเอียดการประเมิน →
        </Link>
      </div>
    </div>
  );
};