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

//format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatErrors(error: any) {
  const { name } = error;
  switch (name) {
    case 'ZodError':
      // handle zod errors
      const fieldErrors = Object.keys(error.errors).map((key) => error.errors[key].message);
      return fieldErrors.join('. ');
    case 'PrismaClientKnownRequestError':
      //handle prisma errors
      const field = error.meta?.target ? error.meta.target[0] : 'Field';
      return `${field.charAt(0).toUpperCase() + field.slice(1)} already exist`;
    default:
      return typeof error.message === 'string' ? error.message : JSON.stringify(error.message);
  }
}