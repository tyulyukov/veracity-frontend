import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UserRole } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRole(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    user: 'Member',
    speaker: 'Speaker',
    admin: 'Admin',
    owner: 'Owner',
  }

  return roleMap[role] || role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
