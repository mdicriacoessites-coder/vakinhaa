import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BadgeCheck, CalendarDays, Flag, Link2, MapPin, Users, ImageOff, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { campaignBySlugQuery, campaignUpdatesQuery, categoriesQuery, STATUS_LABEL } from "@/lib/campaigns";
import { formatBRL, formatDate, progressPercent } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/v/$slug")({
  head: () => ({
    meta: [
      { title: "Vaquinha — Vakinha" },
      { name: "description", content: "Conheça esta campanha e ajude a transformar uma história." },
      { property: "og:title", content: "Vaquinha na Vakinha" },
      { property: "og:description", content: "Conheça esta campanha e ajude a transformar uma história." },
    ],
  }),
  component: CampaignPage,
});

function CampaignPage() {
  const { slug } = Route.useParams();
  const { data: c, isLoading } = useQuery(campaignBySlugQuery(slug));
  const { data: categories } = useQuery(categoriesQuery);
  const { data: updates } = useQuery({ ...campaignUpdatesQuery(c?.id ?? ""), enabled: !!c?.id });

  if (isLoading) return <div className="container-page py-16"><div className="h-80 animate-pulse rounded-2xl bg-muted" /></div>;
  if (!c)
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">Campanha não encontrada</h1>
        <p className="mt-2 text-muted-foreground">Ela pode ter sido removida ou ainda não foi publicada.</p>
        <Button className="mt-6" asChild><Link to="/explorar">Explorar vaquinhas</Link></Button>
      </div>
    );

  const pct = progressPercent(c.raised_amount, c.goal_amount);
  const isPublic = c.status === "published" || c.status === "closed";
  const url = typeof window !== "undefined" ? window.location.href : "";
  const category = categories?.find((x) => x.slug === c.category);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  };
  const shareText = encodeURIComponent(`${c.title} — ajude esta vaquinha: ${url}`);

  return (
    <div className="container-page py-10">
      {!isPublic && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
          <Info className="h-4 w-4" /> Pré-visualização — situação: <strong>{STATUS_LABEL[c.status]}</strong>. Só você vê esta página.
        </div>
      )}
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          {category && <Link to="/explorar" search={{ categoria: category.slug }} className="text-sm font-semibold text-primary">{category.name}</Link>}
          <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">{c.title}</h1>
          <div className="mt-6 overflow-hidden rounded-2xl bg-muted">
            {c.cover_url ? <img src={c.cover_url} alt="" className="aspect-[16/9] w-full object-cover" /> : <div className="grid aspect-[16/9] place-items-center text-muted-foreground"><ImageOff /></div>}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">Organizado por <strong className="text-foreground">{c.organizer_name}</strong>
              {c.identity_verified && <BadgeCheck className="h-4 w-4 text-primary" aria-label="Identidade verificada" />}</span>
            {c.show_location && c.city && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{c.city}{c.state ? `/${c.state}` : ""}</span>}
            {c.end_date && <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />Encerra em {formatDate(c.end_date)}</span>}
          </div>
          <section className="mt-10">
            <h2 className="text-xl font-bold">A história</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground/90">{c.description}</p>
            {c.reason && (<><h3 className="mt-8 font-bold">Para que serve a arrecadação</h3><p className="mt-2 whitespace-pre-line text-foreground/90">{c.reason}</p></>)}
          </section>
          <section className="mt-12">
            <h2 className="text-xl font-bold">Atualizações</h2>
            {updates?.length ? (
              <ol className="mt-4 space-y-4">
                {updates.map((u) => (
                  <li key={u.id} className="rounded-xl border border-border p-5">
                    <p className="text-xs text-muted-foreground">{formatDate(u.created_at)}</p>
                    <p className="mt-1 font-bold">{u.title}</p>
                    <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">{u.body}</p>
                  </li>
                ))}
              </ol>
            ) : <p className="mt-3 text-sm text-muted-foreground">O organizador ainda não publicou atualizações.</p>}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-elevated p-6">
            <p className="text-3xl font-extrabold">{formatBRL(c.raised_amount)}</p>
            <p className="mt-1 text-sm text-muted-foreground">arrecadados de {formatBRL(c.goal_amount)}</p>
            <Progress value={pct} className="mt-4 h-2.5 bg-primary-soft" />
            <div className="mt-3 flex justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-4 w-4" />{c.supporters_count} contribuições</span>
              <span className="font-bold text-primary-deep">{pct}%</span>
            </div>
            <Button size="lg" className="mt-6 w-full" disabled>Fazer uma doação</Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">Doações via PIX serão liberadas em breve.</p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" asChild><a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">WhatsApp</a></Button>
              <Button variant="outline" size="sm" asChild><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">Facebook</a></Button>
              <Button variant="outline" size="sm" onClick={copy}><Link2 />Copiar</Button>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-surface p-4 text-xs text-muted-foreground">
            Os valores mostrados correspondem somente a contribuições confirmadas. <Link to="/p/$slug" params={{ slug: "taxas" }} className="font-semibold text-primary">Taxas e recebimento</Link>
          </div>
          {isPublic && <ReportDialog campaignId={c.id} />}
        </aside>
      </div>
    </div>
  );
}

function ReportDialog({ campaignId }: { campaignId: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const submit = async () => {
    if (!reason) return toast.error("Escolha um motivo");
    setSending(true);
    const { error } = await supabase.from("campaign_reports").insert({
      campaign_id: campaignId, reason, details: details.slice(0, 2000) || null, reporter_id: user?.id ?? null,
    });
    setSending(false);
    if (error) return toast.error("Não foi possível enviar a denúncia.");
    toast.success("Denúncia enviada. Nossa equipe vai analisar.");
    setOpen(false); setReason(""); setDetails("");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="mx-auto mt-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"><Flag className="h-3.5 w-3.5" />Denunciar campanha</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Denunciar campanha</DialogTitle>
          <DialogDescription>Sua denúncia é analisada pela equipe Vakinha.</DialogDescription>
        </DialogHeader>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger><SelectValue placeholder="Motivo" /></SelectTrigger>
          <SelectContent>
            {["Informações falsas", "Possível golpe", "Conteúdo ofensivo", "Uso indevido de imagem", "Outro"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={2000} placeholder="Detalhes (opcional)" rows={4} />
        <Button onClick={submit} disabled={sending}>{sending ? "Enviando..." : "Enviar denúncia"}</Button>
      </DialogContent>
    </Dialog>
  );
}
