"use server"

import { signUp, signIn, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string
  const dateOfBirth = formData.get("dateOfBirth") as string
  const gender = formData.get("gender") as string

  try {
    await signUp({
      email,
      password,
      firstName,
      lastName,
      phone: phone || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
    })

    return { success: true, message: "Registrasi berhasil! Silakan cek email untuk verifikasi." }
  } catch (error: any) {
    return { success: false, message: error.message || "Registrasi gagal" }
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await signIn(email, password)
    redirect("/dashboard")
  } catch (error: any) {
    return { success: false, message: error.message || "Login gagal" }
  }
}

export async function logoutUser() {
  try {
    await signOut()
    redirect("/")
  } catch (error: any) {
    return { success: false, message: error.message || "Logout gagal" }
  }
}
