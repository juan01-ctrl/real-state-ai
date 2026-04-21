"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      await authClient.signOut();
      router.replace("/sign-in");
      router.refresh();
    };

    void run();
  }, [router]);

  return (
    <main className="leadsignal-page flex min-h-screen items-center justify-center bg-[#fbf9f6] text-[#313330]">
      <p className="text-sm uppercase tracking-[0.14em] text-stone-500">Cerrando sesión...</p>
    </main>
  );
}
