"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    
    // REKOMENDASI: Gunakan router.refresh().
    // Ini akan memuat ulang state dari server.
    // Middleware akan menangani redirect jika diperlukan.
    router.refresh();
  };

  return <Button onClick={logout}>Logout</Button>;
}