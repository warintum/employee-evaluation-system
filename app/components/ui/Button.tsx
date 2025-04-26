// app/components/ui/Button.tsx
import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

// สร้าง variants ของปุ่ม
const buttonVariants = cva(
  // คลาสพื้นฐานที่ใช้กับทุก variant
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 shadow",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline: "border border-gray-300 hover:bg-gray-50 shadow-sm",
        secondary: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "underline-offset-4 hover:underline text-blue-600 hover:text-blue-700 p-0",
        success: "bg-green-600 text-white hover:bg-green-700 shadow",
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md text-xs",
        lg: "h-11 px-8 rounded-md",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// คุณสมบัติของปุ่ม
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

// สร้างคอมโพเนนต์ปุ่ม
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, children, ...props }, ref) => {
    console.log('กำลังแสดงปุ่ม:', { variant, size, isLoading })
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }