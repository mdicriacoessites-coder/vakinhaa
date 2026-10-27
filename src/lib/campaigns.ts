import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type CampaignStatus = Database["public"]["Enums"]["campaign_status"];
export type Category = Database["public"]["Tables"]["campaign_categories"]["Row"];
export type CampaignUpdate = Database["public"]["Tables"]["campaign_updates"]["Row"];

export const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Rascunho",
  pending_review: "Em análise",
  published: "Publicada",
  rejected: "Recusada",
  suspended: "Suspensa",
  closed: "Encerrada",
};

export const DEFAULT_CATEGORIES: Category[] = [
  { slug: "saude", name: "Saúde e Tratamentos", description: "Cirurgias, remédios, tratamentos e equipamentos médicos.", sort_order: 1, active: true },
  { slug: "animais", name: "Causa Animal", description: "Resgates, cirurgias veterinárias e proteção a animais.", sort_order: 2, active: true },
  { slug: "educacao", name: "Educação e Estudos", description: "Bolsas de estudo, intercâmbios, reformas escolares e materiais.", sort_order: 3, active: true },
  { slug: "emergencias", name: "Emergências e Ajuda", description: "Desastres naturais, acidentes e apoio imediato.", sort_order: 4, active: true },
  { slug: "projetos-sociais", name: "Projetos Sociais", description: "Ações comunitárias, ONGs e apoio a famílias.", sort_order: 5, active: true },
  { slug: "comunidade", name: "Comunidade", description: "Melhorias de bairros, espaços públicos e eventos locais.", sort_order: 6, active: true },
  { slug: "moradia", name: "Moradia e Reformas", description: "Construção, reconstrução e reformas emergenciais.", sort_order: 7, active: true },
  { slug: "outros", name: "Outros", description: "Sonhos, projetos pessoais e outras causas nobres.", sort_order: 8, active: true },
];

/** Modelos de campanhas prontos para exploração e demonstração */
export const READY_MODELS: Campaign[] = [
  {
    id: "modelo-thor-01",
    slug: "cirurgia-do-caozinho-thor",
    title: "Cirurgia ortopédica e recuperação do cãozinho Thor",
    category: "animais",
    description: `Thor é um vira-lata dócil e alegre que foi resgatado após ser atropelado em uma avenida movimentada. Levado às pressas para a clínica veterinária parceira, o exame de imagem confirmou uma fratura complexa no fêmur esquerdo com lesão ligamentar.

Ele precisa urgentemente de uma cirurgia com colocação de placa ortopédica para que volte a andar sem dor e não perca o movimento da patinha. O valor da vaquinha cobre todo o procedimento cirúrgico, exames pré-operatórios de sangue, anestesia inalatória, medicação pós-cirúrgica e as 10 primeiras sessões de fisioterapia veterinária.

Qualquer quantia faz uma diferença enorme para devolver a alegria e a mobilidade do Thor! Acompanhe fotos e atualizações diárias da recuperação dele aqui.`,
    reason: "Custear a cirurgia ortopédica com colocação de placa no fêmur, exames pré e pós-operatórios, antibióticos, analgésicos e fisioterapia.",
    goal_amount: 8500,
    raised_amount: 5420,
    supporters_count: 48,
    organizer_name: "Mariana Silva (Resgate Animal)",
    identity_verified: true,
    city: "Curitiba",
    state: "PR",
    show_location: true,
    status: "published",
    cover_url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    published_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    end_date: new Date(Date.now() + 25 * 86400000).toISOString(),
    owner_id: "demo-owner-1",
    rejection_reason: null,
  },
  {
    id: "modelo-esperanca-02",
    slug: "reforma-da-sala-de-leitura-escola-esperanca",
    title: "Reforma e revitalização da Sala de Leitura da Escola Esperança",
    category: "educacao",
    description: `A Sala de Leitura da Escola Comunitária Esperança atende diariamente mais de 220 crianças e jovens em situação de vulnerabilidade social. Nosso espaço literário é o coração da escola, onde muitos alunos têm seu primeiro contato com o universo dos livros.

Infelizmente, devido às fortes chuvas do último verão, o teto sofreu infiltrações, danificando estantes de madeira e boa parte do acervo. Queremos reformar o telhado, fazer pintura lúdica nas paredes, instalar novas prateleiras acessíveis, almofadas confortáveis para o cantinho da leitura e adquirir mais de 150 novos livros infantojuvenis.

Contamos com seu apoio para transformar este espaço em um ambiente acolhedor, inspirador e seguro para os nossos pequenos leitores!`,
    reason: "Reforma do telhado, pintura interna, novas estantes modulares, tapetes/almofadas e compra de 150 novos livros infantojuvenis.",
    goal_amount: 15000,
    raised_amount: 11250,
    supporters_count: 89,
    organizer_name: "Professora Helena Castro",
    identity_verified: true,
    city: "Belo Horizonte",
    state: "MG",
    show_location: true,
    status: "published",
    cover_url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    published_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    owner_id: "demo-owner-2",
    rejection_reason: null,
  },
];

const MODEL_UPDATES: Record<string, CampaignUpdate[]> = {
  "modelo-thor-01": [
    {
      id: "up-thor-2",
      campaign_id: "modelo-thor-01",
      author_id: "demo-owner-1",
      title: "Primeira sessão de fisioterapia concluída! 🐾",
      body: "Hoje o Thor fez sua primeira sessão de laser e fisioterapia leve. O veterinário disse que a cicatrização da cirurgia está excelente e ele já começou a apoiar a patinha no chão devagarzinho. Muito obrigado a todos que doaram!",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "up-thor-1",
      campaign_id: "modelo-thor-01",
      author_id: "demo-owner-1",
      title: "Cirurgia realizada com sucesso!",
      body: "Amigos, a cirurgia correu tudo bem graças a Deus e aos veterinários da clínica parceira! A placa ortopédica foi fixada com sucesso. Agora ele precisa de 15 dias de repouso absoluto e medicação para dor.",
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
  ],
  "modelo-esperanca-02": [
    {
      id: "up-esp-2",
      campaign_id: "modelo-esperanca-02",
      author_id: "demo-owner-2",
      title: "Telhado impermeabilizado e primeiros livros entregues! 📚",
      body: "Concluímos o conserto do telhado para evitar novas infiltrações e já encomendamos os primeiros 40 livros infantojuvenis com o valor arrecadado até agora! Agradecemos de coração a cada um dos apoiadores.",
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "up-esp-1",
      campaign_id: "modelo-esperanca-02",
      author_id: "demo-owner-2",
      title: "Início das obras de restauração",
      body: "Começamos hoje a lixar as paredes e preparar o ambiente para a nova pintura colorida. Em breve as crianças terão um cantinho novinho em folha para ler e sonhar!",
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
  ],
};

/** Helpers para persistência local garantida */
export function getLocalCampaigns(): Campaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("vakinha_local_campaigns");
    if (!raw) return [];
    return JSON.parse(raw) as Campaign[];
  } catch {
    return [];
  }
}

export function saveLocalCampaign(c: Campaign): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalCampaigns().filter((x) => x.id !== c.id);
    localStorage.setItem("vakinha_local_campaigns", JSON.stringify([c, ...existing]));
  } catch (err) {
    console.error("Erro ao salvar campanha localmente:", err);
  }
}

export function getLocalUpdates(campaignId: string): CampaignUpdate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`vakinha_updates_${campaignId}`);
    if (!raw) return [];
    return JSON.parse(raw) as CampaignUpdate[];
  } catch {
    return [];
  }
}

export function saveLocalUpdate(u: CampaignUpdate): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalUpdates(u.campaign_id).filter((x) => x.id !== u.id);
    localStorage.setItem(`vakinha_updates_${u.campaign_id}`, JSON.stringify([u, ...existing]));
  } catch (err) {
    console.error("Erro ao salvar atualização:", err);
  }
}

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    try {
      const { data, error } = await supabase
        .from("campaign_categories")
        .select("*")
        .order("sort_order");
      if (!error && data && data.length > 0) return data;
    } catch {
      // Ignora erro e usa categorias locais
    }
    return DEFAULT_CATEGORIES;
  },
  staleTime: 5 * 60_000,
});

export type SearchParams = {
  q?: string;
  categoria?: string;
  situacao?: "ativas" | "encerradas" | "todas";
  ordem?: "relevancia" | "recentes" | "progresso";
};

export const searchCampaignsQuery = (p: SearchParams, limit = 24) =>
  queryOptions({
    queryKey: ["campaigns", "search", p, limit],
    queryFn: async () => {
      let remoteRows: Campaign[] = [];
      try {
        let q = supabase.from("campaigns").select("*");
        const situacao = p.situacao ?? "ativas";
        if (situacao === "ativas") q = q.eq("status", "published");
        else if (situacao === "encerradas") q = q.eq("status", "closed");
        else q = q.in("status", ["published", "closed"]);
        if (p.categoria) q = q.eq("category", p.categoria);
        const term = p.q?.trim().replace(/[%,()]/g, " ");
        if (term) q = q.or(`title.ilike.%${term}%,description.ilike.%${term}%,reason.ilike.%${term}%`);
        if (p.ordem === "recentes") q = q.order("published_at", { ascending: false, nullsFirst: false });
        else q = q.order("supporters_count", { ascending: false }).order("published_at", { ascending: false });
        const { data, error } = await q.limit(limit);
        if (!error && data) remoteRows = data;
      } catch {
        // Fallback para modelos locais e campanhas salvas
      }

      // Combina campanhas locais e modelos prontos
      const localRows = getLocalCampaigns();
      const allCombined = [...localRows, ...remoteRows, ...READY_MODELS];

      // Remove duplicados por ID ou slug
      const seen = new Set<string>();
      const deduped: Campaign[] = [];
      for (const item of allCombined) {
        if (!seen.has(item.id) && !seen.has(item.slug)) {
          seen.add(item.id);
          seen.add(item.slug);
          deduped.push(item);
        }
      }

      // Filtra conforme parâmetros de busca
      let filtered = deduped.filter((c) => {
        const situacao = p.situacao ?? "ativas";
        if (situacao === "ativas" && c.status !== "published") return false;
        if (situacao === "encerradas" && c.status !== "closed") return false;
        if (p.categoria && p.categoria !== "all" && c.category !== p.categoria) return false;
        if (p.q && p.q.trim()) {
          const t = p.q.toLowerCase().trim();
          const match =
            c.title.toLowerCase().includes(t) ||
            c.description.toLowerCase().includes(t) ||
            c.reason.toLowerCase().includes(t) ||
            (c.city && c.city.toLowerCase().includes(t));
          if (!match) return false;
        }
        return true;
      });

      // Ordenação
      if (p.ordem === "progresso") {
        filtered.sort(
          (a, b) => Number(b.raised_amount) / Number(b.goal_amount) - Number(a.raised_amount) / Number(a.goal_amount),
        );
      } else if (p.ordem === "recentes") {
        filtered.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      }

      return filtered.slice(0, limit);
    },
  });

export const campaignBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["campaign", slug],
    queryFn: async () => {
      // 1. Procura nas campanhas locais
      const local = getLocalCampaigns().find((c) => c.slug === slug);
      if (local) return local;

      // 2. Procura nos modelos prontos
      const model = READY_MODELS.find((c) => c.slug === slug);
      if (model) return model;

      // 3. Procura no Supabase
      try {
        const { data, error } = await supabase.from("campaigns").select("*").eq("slug", slug).maybeSingle();
        if (!error && data) return data;
      } catch {
        // Ignora
      }

      return null;
    },
  });

export const campaignUpdatesQuery = (campaignId: string) =>
  queryOptions({
    queryKey: ["campaign-updates", campaignId],
    queryFn: async () => {
      const localUpdates = getLocalUpdates(campaignId);
      const modelUpdates = MODEL_UPDATES[campaignId] ?? [];

      let remoteUpdates: CampaignUpdate[] = [];
      try {
        const { data, error } = await supabase
          .from("campaign_updates")
          .select("*")
          .eq("campaign_id", campaignId)
          .order("created_at", { ascending: false });
        if (!error && data) remoteUpdates = data;
      } catch {
        // Ignora
      }

      const all = [...localUpdates, ...modelUpdates, ...remoteUpdates];
      const seen = new Set<string>();
      return all.filter((u) => {
        if (seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      });
    },
  });

/** Gera slug amigável a partir do título */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base || "vaquinha"}-${randomSuffix}`;
}

/** Cria uma nova vaquinha e persiste localmente e no Supabase */
export async function createNewCampaign(data: {
  title: string;
  category: string;
  goal_amount: number;
  description: string;
  reason: string;
  organizer_name: string;
  city?: string;
  state?: string;
  cover_url?: string;
  end_date?: string;
  status?: CampaignStatus;
}): Promise<Campaign> {
  const slug = generateSlug(data.title);
  const user = (await supabase.auth.getUser()).data.user;

  const newCampaign: Campaign = {
    id: `local-${crypto.randomUUID()}`,
    slug,
    title: data.title.trim(),
    category: data.category,
    goal_amount: Number(data.goal_amount),
    raised_amount: 0,
    supporters_count: 0,
    description: data.description.trim(),
    reason: data.reason.trim(),
    organizer_name: data.organizer_name.trim(),
    city: data.city?.trim() || null,
    state: data.state?.trim() || null,
    show_location: !!(data.city && data.state),
    cover_url: data.cover_url || null,
    end_date: data.end_date || null,
    identity_verified: false,
    status: data.status || "published",
    created_at: new Date().toISOString(),
    published_at: data.status === "draft" ? null : new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: user?.id || "anon-user",
    rejection_reason: null,
  };

  // 1. Salva localmente garantindo persistência imediata
  saveLocalCampaign(newCampaign);

  // 2. Tenta salvar no Supabase se houver sessão ou permissão
  try {
    const { data: inserted, error } = await supabase.from("campaigns").insert({
      title: newCampaign.title,
      slug: newCampaign.slug,
      category: newCampaign.category,
      goal_amount: newCampaign.goal_amount,
      raised_amount: 0,
      supporters_count: 0,
      description: newCampaign.description,
      reason: newCampaign.reason,
      organizer_name: newCampaign.organizer_name,
      city: newCampaign.city,
      state: newCampaign.state,
      show_location: newCampaign.show_location,
      cover_url: newCampaign.cover_url,
      end_date: newCampaign.end_date,
      identity_verified: false,
      status: newCampaign.status,
      owner_id: user?.id || crypto.randomUUID(),
    }).select().maybeSingle();

    if (!error && inserted) {
      saveLocalCampaign(inserted);
      return inserted;
    }
  } catch (err) {
    console.warn("Aviso ao sincronizar com Supabase (salvo localmente):", err);
  }

  return newCampaign;
}

/** Uploads a cover to the private bucket and returns a long-lived signed URL. */
export async function uploadCover(userId: string, file: File) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) throw new Error("Use uma imagem JPG, PNG ou WEBP.");
  if (file.size > 5 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 5 MB.");
  const ext = file.type.split("/")[1];
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("campaign-covers").upload(path, file, { contentType: file.type });
  if (error) throw new Error("Não foi possível enviar a imagem. Tente novamente.");
  const { data, error: e2 } = await supabase.storage
    .from("campaign-covers")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw new Error("Não foi possível gerar o link da imagem.");
  return data.signedUrl;
}
