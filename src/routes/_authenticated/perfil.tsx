import { createFileRoute, Link } from "@tanstack/react-router";
import { User, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [{ title: "Meu Perfil — Vakinha" }],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  return (
    <div className="container-page py-12 max-w-2xl">
      <div className="card-elevated p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
          <User className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Perfil do Usuário</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gerencie sua conta e suas preferências no Vakinha.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/painel">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Ir para o Painel
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
