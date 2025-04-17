import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generate() {
  let output = '';
  for (let i = 0; i < 12; i++) {
    const rand = Math.floor(Math.random() * 62);
    const charCode = rand + (rand < 10 ? 48 : rand < 36 ? 55 : 61);
    output += String.fromCharCode(charCode);
  }
  return output;
}