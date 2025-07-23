"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Database, Settings } from "lucide-react"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function DemoBanner() {
  const { isConfigured } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)

  if (isConfigured) {
    return null
  }

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <strong>Mode Demo:</strong> Website berjalan dengan data contoh.
            {!isExpanded && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-blue-600 underline ml-1"
                onClick={() => setIsExpanded(true)}
              >
                Lihat cara setup →
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <Settings className="h-4 w-4" />
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 p-3 bg-blue-100 rounded-md text-sm">
            <p className="font-semibold mb-2">Untuk mengaktifkan fitur lengkap:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Buat project di{" "}
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">
                  supabase.com
                </a>
              </li>
              <li>
                Jalankan script database dari folder <code className="bg-blue-200 px-1 rounded">scripts/</code>
              </li>
              <li>
                Set environment variables:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>
                    <code className="bg-blue-200 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>
                  </li>
                  <li>
                    <code className="bg-blue-200 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                  </li>
                  <li>
                    <code className="bg-blue-200 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>
                  </li>
                </ul>
              </li>
            </ol>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-blue-600 underline mt-2"
              onClick={() => setIsExpanded(false)}
            >
              ← Sembunyikan
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
