import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const PUSHER_APP_ID = process.env.PUSHER_APP_ID || ''
export const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || ''
export const PUSHER_SECRET = process.env.PUSHER_SECRET || ''
export const PUSHER_CLUSTER = 'ap1'