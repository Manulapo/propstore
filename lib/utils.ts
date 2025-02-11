import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// convert from prisma obj to plain obj
export function convertPrismaObj<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// format number to valid price
export function formatPrice(price: number): string {
  const [int, decimal] = price.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
}