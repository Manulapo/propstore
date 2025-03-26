import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// convert from prisma obj to plain obj
export function convertPrismaObj<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// format number to valid price
export function formatPrice(price: number): string {
  const [int, decimal] = price.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

//format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatErrors(error: any): Promise<string> {
  const { name } = error;
  switch (name) {
    case "ZodError":
      // handle zod errors
      const fieldErrors = Object.keys(error.errors).map(
        (key) => error.errors[key].message
      );
      return fieldErrors.join(". ");
    case "PrismaClientKnownRequestError":
      //handle prisma errors
      const field = error.meta?.target ? error.meta.target[0] : "Field";
      return `${field.charAt(0).toUpperCase() + field.slice(1)} already exist`;
    default:
      return typeof error.message === "string"
        ? error.message
        : JSON.stringify(error.message);
  }
}

// round number to 2 decimal places
export function roundNumber(num: number | string): number {
  const parsedNum = typeof num === "string" ? Number(num) : num;
  if (isNaN(parsedNum)) {
    throw new Error(`Value ${parsedNum} is not a number or string`);
  }
  // EPSILON is used to handle floating point errors in JS
  return Math.round((parsedNum + Number.EPSILON) * 100) / 100;
}

//currenccy formatter
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 2,
});

export const formatCurrency = (amount: number | string | null) => {
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(parseFloat(amount));
  } else {
    return NaN;
  }
};

// shorten uuid for orders
export function formatid(id: string) {
  return `..${id.substring(id.length - 6)}`; //example: ..cde123 from 123456cde123
}

// format date and times
export const formatDate = (dateString: Date) => {
  const localOption: string = "en-US";
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    year: "numeric", // numeric year (e.g., '2019')
    month: "short", // abbreviated month (e.g., 'Jan')
    day: "numeric", // numeric day (e.g., '1')
    hour: "numeric", // numeric hour (e.g., '1')
    minute: "numeric", // numeric minute (e.g., '30')
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric", // numeric year (e.g., '2019')
    month: "short", // abbreviated month (e.g., 'Jan')
    day: "numeric", //  numeric day (e.g., '1')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '1')
    minute: "numeric", // numeric minute (e.g., '30')
  };

  const formattedDateTime: string = new Date(dateString).toLocaleDateString(
    localOption,
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleDateString(
    localOption,
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleDateString(
    localOption,
    timeOptions
  );

  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};
