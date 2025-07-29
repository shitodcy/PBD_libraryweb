import { RegisterForm } from '@/components/forms/RegisterForm'; // ✅ Benar


export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Daftar Member Baru</h1>
        <RegisterForm />
      </div>
    </div>
  )
}
