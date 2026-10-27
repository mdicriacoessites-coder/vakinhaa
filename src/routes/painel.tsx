import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { 
  PlusCircle, LayoutDashboard, HeartHandshake, Eye, Sparkles, 
  MessageSquarePlus, Users, Link2, Check
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getLocalCampaigns, saveLocalUpdate, STATUS_LABEL, type Campaign } from "@/lib/campaigns";
import { formatBRL, progressPercent } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Meu Painel — Vakinha" },
      { name: "description", content: "Gerencie suas vaquinhas online e acompanhe as doações." },
    ],
  }),
  component: PainelPage,
});

function PainelPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => getLocalCampaigns());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calcula estatísticas
  const totalRaised = campaigns.reduce((acc, c) => acc + Number(c.raised_amount || 0), 0);
  const totalGoal = campaigns.reduce((acc, c) => acc + Number(c.goal_amount || 0), 0);
  const totalSupporters = campaigns.reduce((acc, c) => acc + Number(c.supporters_count || 0), 0);

  const copyLink = async (slug: string, id: string) => {
    const url = `${window.location.origin}/v/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link da vaquinha copiado para a área de transferência!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="container-page py-10 md:py-14">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Meu Painel</h1>
          <p className="mt-1 text-muted-foreground">
            {user ? `Olá, ${user.user_metadata?.full_name || user.email}! ` : ""}
            Acompanhe o desempenho das suas vaquinhas.
          </p>
        </div>
        <Button size="lg" asChild className="gap-2 shadow-sm">
          <Link to="/criar">
            <PlusCircle className="h-4 w-4" /> Criar nova vaquinha
          </Link>
        </Button>
      </div>

      {/* Cards de Métricas */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card-elevated p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Arrecadado</p>
          <p className="mt-2 text-2xl font-extrabold text-foreground">{formatBRL(totalRaised)}</p>
          <p className="mt-1 text-xs text-muted-foreground">de {formatBRL(totalGoal)} em metas</p>
        </div>
        <div className="card-elevated p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Apoiadores</p>
          <p className="mt-2 text-2xl font-extrabold text-foreground">{totalSupporters}</p>
          <p className="mt-1 text-xs text-muted-foreground">contribuições confirmadas</p>
        </div>
        <div className="card-elevated p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Minhas Vaquinhas</p>
          <p className="mt-2 text-2xl font-extrabold text-primary">{campaigns.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">{campaigns.filter(c => c.status === "published").length} ativas</p>
        </div>
      </div>

      {/* Lista de Vaquinhas */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold">Minhas campanhas</h2>

        {campaigns.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary-deep">
              <HeartHandshake className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-bold">Você ainda não criou nenhuma vaquinha</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Tire sua ideia do papel ou peça ajuda para quem precisa. É rápido, simples e você já pode compartilhar o link.
            </p>
            <Button className="mt-6" size="lg" asChild>
              <Link to="/criar">Criar minha primeira vaquinha</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {campaigns.map((c) => {
              const pct = progressPercent(c.raised_amount, c.goal_amount);
              return (
                <div key={c.id} className="card-elevated flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center">
                  <div className="flex gap-4">
                    {c.cover_url && (
                      <img
                        src={c.cover_url}
                        alt=""
                        className="hidden h-24 w-36 rounded-xl object-cover sm:block"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary-deep">
                          {STATUS_LABEL[c.status] || "Ativa"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Criada em {new Date(c.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-bold hover:text-primary transition-colors">
                        <Link to="/v/$slug" params={{ slug: c.slug }}>{c.title}</Link>
                      </h3>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{formatBRL(c.raised_amount)}</span> de {formatBRL(c.goal_amount)}
                        <span>•</span>
                        <span>{c.supporters_count} apoiadores</span>
                      </div>
                      <Progress value={pct} className="mt-3 h-2 w-64 bg-primary-soft" />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/v/$slug" params={{ slug: c.slug }}>
                        <Eye className="mr-1 h-3.5 w-3.5" /> Ver vaquinha
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(c.slug, c.id)}
                    >
                      {copiedId === c.id ? <Check className="mr-1 h-3.5 w-3.5 text-primary" /> : <Link2 className="mr-1 h-3.5 w-3.5" />}
                      {copiedId === c.id ? "Copiado!" : "Copiar link"}
                    </Button>
                    <AddUpdateDialog campaignId={c.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AddUpdateDialog({ campaignId }: { campaignId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handlePost = () => {
    if (!title.trim() || !body.trim()) {
      return toast.error("Preencha o título e o texto da novidade.");
    }

    saveLocalUpdate({
      id: `up-${crypto.randomUUID()}`,
      campaign_id: campaignId,
      author_id: "me",
      title: title.trim(),
      body: body.trim(),
      created_at: new Date().toISOString(),
    });

    toast.success("Atualização publicada com sucesso!");
    setOpen(false);
    setTitle("");
    setBody("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <MessageSquarePlus className="mr-1 h-3.5 w-3.5" /> Postar novidade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publicar atualização na vaquinha</DialogTitle>
        </DialogHeader>
        <div className="mt-3 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Título da novidade</label>
            <Input
              placeholder="Ex: Cirurgia realizada com sucesso! ou Primeiras compras feitas..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Texto completo</label>
            <Textarea
              placeholder="Conte aos apoiadores como está o andamento da causa..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="mt-1"
            />
          </div>
          <Button onClick={handlePost} className="w-full">
            Publicar atualização
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
