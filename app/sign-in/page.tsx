"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.email({
        email,
        password
      });

      if (result.error) {
        setError(result.error.message ?? "No se pudo iniciar sesión");
        return;
      }

      router.push("/leads");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="aesthete-page flex min-h-screen items-center justify-center bg-[#fbf9f6] p-4 text-[#313330]">
      <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#58624e]">Aesthete AI</p>
        <h1 className="mt-2 text-3xl serif">Ingresar</h1>
        <p className="mt-2 text-sm text-stone-500">Accedé a tu espacio de inteligencia comercial.</p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-widest text-stone-500">Email</span>
            <input
              className="w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#58624e]"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-widest text-stone-500">Contraseña</span>
            <input
              className="w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#58624e]"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="text-sm text-[#a73b21]">{error}</p> : null}

          <button
            className="w-full rounded bg-[#58624e] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f2fde3] disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-5 text-sm text-stone-500">
          Las cuentas de operador las da el administrador de tu agencia (no hay registro público).
        </p>
      </div>
    </main>
  );
}
