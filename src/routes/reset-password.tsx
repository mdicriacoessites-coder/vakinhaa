import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha — Vakinha" },
      { name: "description", content: "Defina uma nova senha para sua conta Vakinha." },
      { property: "og:title", content: "Nova senha — Vakinha" },
      { property: "og:description", content: "Defina uma nova senha para sua conta Vakinha." },
    ],
  }),
  component: Page,
});

function Page() {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return toast.error("A senha deve ter pelo menos 8 caracteres");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) return toast.error("Link inválido ou expirado. Solicite um novo.");
    toast.success("Senha atualizada!");
    navigate({ to: "/painel" });
  };
  return (
    <div className="container-page flex justify-center py-16">
      <form onSubmit={submit} className="card-elevated w-full max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-extrabold">Definir nova senha</h1>
        <div className="space-y-1.5"><Label htmlFor="pw">Nova senha</Label><Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></div>
        <Button className="w-full" size="lg" disabled={loading}>{loading ? "Salvando..." : "Salvar senha"}</Button>
      </form>
    </div>
  );
}
