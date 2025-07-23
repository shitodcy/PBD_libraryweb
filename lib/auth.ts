import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  gender?: string
}

export interface AuthResult {
  user: User | null
  session: any
}

export async function signUp(userData: SignUpData): Promise<AuthResult> {
  const { email, password, firstName, lastName, phone, dateOfBirth, gender } = userData

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
      },
    },
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error("Failed to create user")
  }

  // Create user profile in the users table
  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    email: authData.user.email,
    first_name: firstName,
    last_name: lastName,
    phone: phone || null,
    date_of_birth: dateOfBirth || null,
    gender: gender || null,
    role: "member",
    status: "active",
  })

  if (profileError) {
    console.error("Error creating user profile:", profileError)
    // Don't throw here as the auth user was created successfully
  }

  return {
    user: authData.user,
    session: authData.session,
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    user: data.user,
    session: data.session,
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error("Error getting current user:", error)
    return null
  }

  return user
}

export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error("Error getting current session:", error)
    return null
  }

  return session
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error getting user profile:", error)
    return null
  }

  return data
}

export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw new Error(error.message)
  }
}
