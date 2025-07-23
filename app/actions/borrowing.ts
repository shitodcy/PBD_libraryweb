"use server"

import { borrowBook, returnBook, extendBorrowing } from "@/lib/borrowing"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function borrowBookAction(bookId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, message: "Anda harus login terlebih dahulu" }
    }

    const result = await borrowBook(user.id, bookId)

    if (result.success) {
      revalidatePath("/dashboard")
      revalidatePath("/catalog")
    }

    return result
  } catch (error: any) {
    return { success: false, message: error.message || "Terjadi kesalahan sistem" }
  }
}

export async function returnBookAction(borrowingId: string) {
  try {
    const result = await returnBook(borrowingId)

    if (result.success) {
      revalidatePath("/dashboard")
      revalidatePath("/catalog")
    }

    return result
  } catch (error: any) {
    return { success: false, message: error.message || "Terjadi kesalahan sistem" }
  }
}

export async function extendBorrowingAction(borrowingId: string) {
  try {
    const result = await extendBorrowing(borrowingId)

    if (result.success) {
      revalidatePath("/dashboard")
    }

    return result
  } catch (error: any) {
    return { success: false, message: error.message || "Terjadi kesalahan sistem" }
  }
}
