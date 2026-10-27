import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const searchSchema = z.object({ next: z.string().optional() });
const safeNext = (n?: string) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/painel");

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar — Vakinha" },
      { name: "description", content: "Entre ou crie sua conta na Vakinha." },
      { property: "og:title", content: "Entrar — Vakinha" },
      { property: "og:description", content: "Entre ou crie sua conta na Vakinha." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("E-mail inválido").max(255);
const passSchema = z.string().min(8, "A senha deve ter pelo menos 8 caracteres").max(72);

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    const go = () => navigate({ to: safeNext(next) as "/painel" });
    supabase.auth.getSession().then(({ data }) => data.session && go());
    const { data } = supabase.auth.onAuthStateChange((e, s) => { if (e === "SIGNED_IN" && s) go(); });
    return () => data.subscription.unsubscribe();
  }, [next, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = emailSchema.safeParse(email);
    if (!em.success) return toast.error(em.error.issues[0].message);
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(em.data, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent("Enviamos um link para redefinir sua senha. Confira seu e-mail.");
        return;
      }
      const pw = passSchema.safeParse(password);
      if (!pw.success) return toast.error(pw.error.issues[0].message);
      if (mode === "signup") {
        if (name.trim().length < 2) return toast.error("Informe seu nome");
        const { error } = await supabase.auth.signUp({
          email: em.data, password: pw.data,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name.trim().slice(0, 100) } },
        });
        if (error) throw error;
        setSent("Conta criada! Confirme seu e-mail pelo link que enviamos para entrar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: em.data, password: pw.data });
        if (error) throw error;
      }
    } catch (err) {
      const msg = (err as Error).message;
      toast.error(
        msg.includes("Invalid login") ? "E-mail ou senha incorretos." :
        msg.includes("not confirmed") ? "Confirme seu e-mail antes de entrar." :
        msg.includes("rate limit") || msg.includes("security purposes") ? "Muitas tentativas. Aguarde alguns minutos." :
        msg.includes("already registered") ? "Este e-mail já tem uma conta." :
        "Não foi possível concluir. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" + (next ? `?next=${encodeURIComponent(next)}` : "") });
    if (r.error) toast.error("Não foi possível entrar com Google.");
  };

  return (
    <div className="container-page flex justify-center py-16">
      <div className="card-elevated w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold">
          {mode === "login" ? "Entrar na Vakinha" : mode === "signup" ? "Criar sua conta" : "Recuperar senha"}
        </h1>
        {sent ? (
          <div className="mt-6 rounded-xl bg-primary-soft p-4 text-sm text-primary-deep">{sent}</div>
        ) : (
          <>
            {mode !== "forgot" && (
              <>
                <Button variant="outline" className="mt-6 w-full" onClick={google} type="button">Continuar com Google</Button>
                <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />ou<span className="h-px flex-1 bg-border" /></div>
              </>
            )}
            <form onSubmit={submit} className={mode === "forgot" ? "mt-6 space-y-4" : "space-y-4"}>
              {mode === "signup" && (
                <div className="space-y-1.5"><Label htmlFor="name">Nome completo</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" /></div>
              )}
              <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
              {mode !== "forgot" && (
                <div className="space-y-1.5"><Label htmlFor="pw">Senha</Label><Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></div>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Aguarde..." : mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"}
              </Button>
            </form>
          </>
        )}
        <div className="mt-6 flex flex-col gap-2 text-center text-sm">
          {mode === "login" && (
            <>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => { setMode("forgot"); setSent(null); }}>Esqueci minha senha</button>
              <button className="font-semibold text-primary" onClick={() => { setMode("signup"); setSent(null); }}>Não tem conta? Cadastre-se</button>
            </>
          )}
          {mode !== "login" && <button className="font-semibold text-primary" onClick={() => { setMode("login"); setSent(null); }}>Já tenho conta — entrar</button>}
        </div>
        {mode === "signup" && <p className="mt-4 text-center text-xs text-muted-foreground">Ao criar a conta você aceita os Termos de uso e a Política de privacidade.</p>}
      </div>
    </div>
  );
}
