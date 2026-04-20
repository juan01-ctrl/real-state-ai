"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./create-demo-button.module.css";
import { Button } from "@/components/ui/button";

export function CreateDemoLeadsButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/leads/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error("No se pudieron crear los leads de demostración");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al crear leads de demostración");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button size="sm" disabled={loading} onClick={handleCreate}>
        {loading ? "Creando…" : "Crear leads de demostración"}
      </Button>
      {error ? <p className={styles.errorText}>{error}</p> : null}
    </div>
  );
}
