import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// convert from prisma obj to plain obj
export function convertPrismaObj<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}
