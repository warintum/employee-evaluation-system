// app/lib/cn.ts
import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * รวมคลาส CSS เข้าด้วยกันและจัดการความซ้ำซ้อนของ Tailwind CSS
 * @param inputs - รายการคลาส CSS ที่ต้องการรวม
 * @returns string - คลาส CSS ที่รวมแล้ว
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}