import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Sparkles, HeartHandshake, Image as ImageIcon, CheckCircle2, ArrowRight,
  MapPin, ShieldCheck, HelpCircle, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_CATEGORIES, createNewCampaign } from "@/lib/campaigns";
import { Progress } from "@/components/ui/progress";
import { formatBRL } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/criar")({
  head: () => ({
    meta: [
      { title: "Criar minha vaquinha — Vakinha" },
      { name: "description", content: "Crie sua vaquinha online em minutos e comece a receber apoio para a sua causa." },
      { property: "og:title", content: "Criar minha vaquinha — Vakinha" },
      { property: "og:description", content: "Crie sua vaquinha online em minutos e comece a receber apoio para a sua causa." },
    ],
  }),
  component: CriarVaquinhaPage,
});

const SUGGESTED_PHOTOS = [
  {
    label: "Saúde / Tratamento",
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Causa Animal / Pet",
    url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Educação / Estudos",
    url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Família / Moradia",
    url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Solidariedade / Alimentos",
    url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
  },
];

const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

function CriarVaquinhaPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("saude");
  const [goal, setGoal] = useState("5000");
  const [organizer, setOrganizer] = useState(user?.user_metadata?.full_name || "");
  const [city, setCity] = useState("");
  const [state, setState] = useState("SP");
  const [coverUrl, setCoverUrl] = useState(SUGGESTED_PHOTOS[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const goalNumber = Math.max(10, Number(goal) || 0);

  const handleCreate = async (asDraft = false) => {
    if (!title.trim() || title.trim().length < 5) {
      return toast.error("O título deve ter pelo menos 5 caracteres.");
    }
    if (!organizer.trim()) {
      return toast.error("Informe o nome de quem está organizando a vaquinha.");
    }
    if (goalNumber < 10) {
      return toast.error("A meta mínima para criar uma vaquinha é de R$ 10,00.");
    }
    if (!description.trim() || description.trim().length < 20) {
      return toast.error("Conte mais sobre a história da sua vaquinha (mínimo de 20 caracteres).");
    }

    setSubmitting(true);
    try {
      const finalCover = customPhotoUrl.trim() || coverUrl;

      const created = await createNewCampaign({
        title: title.trim(),
        category,
        goal_amount: goalNumber,
        organizer_name: organizer.trim(),
        city: city.trim() || undefined,
        state: state || undefined,
        cover_url: finalCover,
        description: description.trim(),
        reason: reason.trim() || "Arrecadação para cobrir os custos informados na história.",
        status: asDraft ? "draft" : "published",
      });

      toast.success(asDraft ? "Rascunho salvo com sucesso!" : "Sua vaquinha foi criada com sucesso! 🎉");
      navigate({ to: "/v/$slug", params: { slug: created.slug } });
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro ao criar a vaquinha. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-10 md:py-14">
      {/* Cabeçalho */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-deep">
          <Sparkles className="h-3.5 w-3.5" /> Comece agora mesmo em menos de 2 minutos
        </span>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
          Criar minha <span className="text-primary">vaquinha online</span>
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          Conte sua história, defina a sua meta e receba o apoio de amigos, familiares e de toda a comunidade.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Formulário Principal */}
        <div className="card-elevated space-y-8 p-6 sm:p-8">
          {/* Seção 1: Informações Básicas */}
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              Sobre a sua causa
            </h2>
            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="title">Título da vaquinha *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Cirurgia urgente do cãozinho Thor, Reforma da escola..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 h-11"
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-muted-foreground">Um título claro e objetivo chama mais atenção dos apoiadores.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="mt-1.5 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_CATEGORIES.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="goal">Meta de arrecadação (R$) *</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">R$</span>
                    <Input
                      id="goal"
                      type="number"
                      min="10"
                      step="50"
                      placeholder="5000"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="h-11 pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border/70" />

          {/* Seção 2: História e Objetivo */}
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              Conte sua história
            </h2>
            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="description">Descrição detalhada da história *</Label>
                <Textarea
                  id="description"
                  placeholder="Conte quem você é, o que aconteceu e por que essa ajuda é tão importante..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5 min-h-[140px]"
                />
                <p className="mt-1 text-xs text-muted-foreground">Seja sincero e detalhe as necessidades para gerar confiança.</p>
              </div>

              <div>
                <Label htmlFor="reason">Como o dinheiro arrecadado será usado?</Label>
                <Textarea
                  id="reason"
                  placeholder="Ex: R$ 3.000 para exames e medicamentos, R$ 2.000 para procedimentos..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1.5 min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <hr className="border-border/70" />

          {/* Seção 3: Imagem de Capa e Organizador */}
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              Imagem e Identificação
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <Label>Escolha uma foto de capa ilustrativa ou insira uma sua</Label>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {SUGGESTED_PHOTOS.map((photo) => (
                    <button
                      key={photo.url}
                      type="button"
                      onClick={() => {
                        setCoverUrl(photo.url);
                        setCustomPhotoUrl("");
                      }}
                      className={`group relative aspect-[16/10] overflow-hidden rounded-xl border-2 text-left transition-all ${
                        coverUrl === photo.url && !customPhotoUrl
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img src={photo.url} alt={photo.label} className="h-full w-full object-cover transition group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-1.5 left-2 right-2 truncate text-[11px] font-semibold text-white">
                        {photo.label}
                      </span>
                      {coverUrl === photo.url && !customPhotoUrl && (
                        <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 rounded-full bg-primary text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="customPhoto">Ou cole a URL de uma imagem própria (opcional)</Label>
                <Input
                  id="customPhoto"
                  placeholder="https://exemplo.com/minha-foto.jpg"
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>

              <div>
                <Label htmlFor="organizer">Nome de quem está organizando *</Label>
                <Input
                  id="organizer"
                  placeholder="Seu nome completo ou nome da ONG/projeto"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  className="mt-1.5 h-11"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">Cidade (opcional)</Label>
                  <Input
                    id="city"
                    placeholder="Ex: São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado (UF)</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger id="state" className="mt-1.5 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BRASIL.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="pt-2">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="flex-1 text-base font-bold shadow-md"
                disabled={submitting}
                onClick={() => handleCreate(false)}
              >
                {submitting ? "Publicando..." : "Publicar minha vaquinha agora"}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={submitting}
                onClick={() => handleCreate(true)}
              >
                Salvar como rascunho
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Ao criar, você concorda com nossos termos de transparência e regras da comunidade.
            </p>
          </div>
        </div>

        {/* Pré-visualização em Tempo Real (Card e Benefícios) */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                <Eye className="h-4 w-4" /> Prévia de como sua vaquinha vai aparecer
              </h3>
              <span className="rounded bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary-deep">Ao vivo</span>
            </div>

            {/* Card Preview */}
            <div className="card-elevated mt-3 overflow-hidden shadow-lift border-primary/20">
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={customPhotoUrl.trim() || coverUrl}
                  alt="Prévia da capa"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                  {DEFAULT_CATEGORIES.find((c) => c.slug === category)?.name || "Geral"}
                </span>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <h3 className="line-clamp-2 text-lg font-bold leading-snug">
                  {title.trim() || "Título da sua vaquinha aparecerá aqui"}
                </h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    por <strong>{organizer.trim() || "Seu Nome"}</strong>
                  </span>
                  {city && state && (
                    <span className="flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3" /> {city}/{state}
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-2 pt-2">
                  <Progress value={0} className="h-2 bg-primary-soft" />
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-bold text-foreground">R$ 0,00</span>
                    <span className="text-muted-foreground">meta de {formatBRL(goalNumber)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>0 apoiadores</span>
                    <span className="font-semibold text-primary-deep">0% alcançado</span>
                  </div>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {description.trim() || "Sua história inspirará pessoas de todo o Brasil a colaborar..."}
                </p>
              </div>
            </div>

            {/* Dicas e Segurança */}
            <div className="mt-6 rounded-2xl border border-border bg-surface p-5 space-y-3">
              <h4 className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" /> Dicas para arrecadar mais:
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4">
                <li>Compartilhe o link no WhatsApp e nas redes sociais logo após criar.</li>
                <li>Mantenha a meta realista para incentivar as primeiras doações.</li>
                <li>Publique novidades e fotos do andamento da sua causa.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
