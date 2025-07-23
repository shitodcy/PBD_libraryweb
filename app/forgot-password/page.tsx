"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Lupa Password</CardTitle>
          <CardDescription>
            Masukkan email Anda dan kami akan mengirimkan link untuk mereset password Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Kirim Link Reset
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="link" asChild>
              <Link href="/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}