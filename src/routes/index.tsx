import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  BadgeCheck, Heart, MapPin, Share2, Copy, Check, 
  QrCode, Sparkles, ShieldCheck, AlertCircle,
  PawPrint, Calendar, MessageSquareHeart, ChevronDown, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createPromissePix, checkPromissePixStatus } from "@/lib/promisse";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "140 cães resgatados dependem de você — SOS Abrigo Patas da Esperança" },
      { name: "description", content: "140 cães resgatados dependem de você para comer e sobreviver. Não deixe a fome vencer! Doe qualquer valor via PIX." },
      { property: "og:title", content: "140 cães resgatados dependem de você — SOS Abrigo Patas da Esperança" },
      { property: "og:description", content: "140 cães resgatados dependem de você para comer e sobreviver. Não deixe a fome vencer! Doe via PIX." },
      { property: "og:image", content: "/banner-principal.jpg" },
    ],
  }),
  component: DogShelterCampaignPage,
});

// Fotos dos cães resgatados no abrigo
const DOG_GALLERY = [
  {
    name: "Mel",
    tag: "Cirurgia Urgente",
    desc: "Foi atropelada e sofreu uma fratura grave na coluna. Agora precisa de uma cirurgia urgente e de meses de recuperação para ter a chance de voltar a andar.",
    img: "/dogs/mel.png",
  },
  {
    name: "Thor",
    tag: "Tratamento Contínuo",
    desc: "Foi resgatado com uma infecção grave e precisa de medicamentos caros e tratamento contínuo. Sem ajuda, sua recuperação fica cada vez mais difícil.",
    img: "/dogs/thor.png",
  },
  {
    name: "Luna",
    tag: "Cirurgia de Tumor",
    desc: "Foi encontrada com um tumor que precisa ser operado. Ela ainda é tão carinhosa, mas precisa de ajuda para conseguir o tratamento que pode salvar sua vida.",
    img: "/dogs/luna.png",
  },
  {
    name: "Bento",
    tag: "Cirurgia & Fisioterapia",
    desc: "Perdeu os movimentos das patas traseiras após um acidente. Precisa de exames, cirurgia na coluna e fisioterapia para tentar recuperar seus movimentos.",
    img: "/dogs/bento.png",
  },
  {
    name: "Amora",
    tag: "Remédios de Alto Custo",
    desc: "Sofre de uma doença que exige remédios de alto custo todos os meses. Ela luta para melhorar, mas não pode interromper o tratamento de que tanto precisa.",
    img: "/dogs/amora.png",
  },
];

const PRESET_AMOUNTS = [
  { val: 20, label: "R$ 20", impact: "Alimenta 1 cão por 5 dias" },
  { val: 50, label: "R$ 50", impact: "Vacina e vermífugo completo" },
  { val: 100, label: "R$ 100", impact: "Ração premium e medicação" },
  { val: 250, label: "R$ 250", impact: "Exames e cirurgia ortopédica" },
  { val: 500, label: "R$ 500", impact: "Padrinho mensal de 1 canil" },
  { val: 1000, label: "R$ 1.000", impact: "Sustento e reforma do abrigo" },
];

const INITIAL_DONORS = [
  { name: "Mariana S.", amount: 50, time: "há 12 min", msg: "Força guerreiros! Que os peludos fiquem bem alimentados." },
  { name: "Gabriel Mendes", amount: 250, time: "há 22 min", msg: "Ajuda para a cirurgia da Mel! Vai dar tudo certo, guerreira. 🐾" },
  { name: "Lucas Ferreira", amount: 100, time: "há 34 min", msg: "Para a Mel e o Bento! Trabalho lindo e incansável de vocês." },
  { name: "Patrícia Antunes", amount: 500, time: "há 48 min", msg: "Apoiando o tratamento do Thor e os canis. Parabéns pela dedicação!" },
  { name: "Ana Beatriz", amount: 250, time: "há 1h", msg: "Deus abençoe esse abrigo. Todos os meses vou ajudar!" },
  { name: "Rodrigo & Família", amount: 50, time: "há 1h", msg: "Na torcida para a Luna se recuperar logo da cirurgia do tumor. ❤️" },
  { name: "Doador Anônimo", amount: 20, time: "há 2h", msg: "Um pouquinho de cada um salva muitas vidas." },
  { name: "Juliana Alencar", amount: 150, time: "há 2h", msg: "Para os remédios contínuos da Amora. Não desistam dela!" },
  { name: "Camila Rocha", amount: 50, time: "há 3h", msg: "Vida longa a esse abrigo abençoado! ❤️" },
  { name: "Carlos Eduardo", amount: 300, time: "há 4h", msg: "Para as sessões de fisioterapia do Bento voltar a andar." },
  { name: "Dra. Fernanda Lima", amount: 200, time: "há 5h", msg: "Muito amor por esse trabalho sério. Parabéns a todos os voluntários." },
  { name: "Marcela & Bruno", amount: 50, time: "há 6h", msg: "Contribuição com muito carinho para a ração dos peludinhos." },
  { name: "Thiago Vasconcelos", amount: 100, time: "há 6h", msg: "Que o Bento volte a correr logo! Estamos na torcida por você, amigão." },
  { name: "Vanessa Pires", amount: 80, time: "há 7h", msg: "Doação para comprar os medicamentos da infecção do Thor. Fique forte!" },
  { name: "Beatriz Nogueira", amount: 50, time: "há 7h", msg: "Melzinha amada, logo você estará recuperada e sem dor. Que Deus abençoe os veterinários." },
  { name: "Doador Solidário", amount: 20, time: "há 8h", msg: "Pouco mas de coração. Que não falte ração para esses 140 anjos." },
  { name: "Felipe & Aline", amount: 200, time: "há 8h", msg: "Apoiando a cirurgia da Luna. Ela merece viver feliz e com saúde!" },
  { name: "Renata Silveira", amount: 150, time: "há 9h", msg: "Para a Amora continuar o tratamento sem faltar remédio. Não percam a esperança!" },
  { name: "Cláudio Santos", amount: 100, time: "há 10h", msg: "Ajuda para o saco de ração premium dos canis dos idosos." },
  { name: "Letícia M.", amount: 50, time: "há 10h", msg: "Parabéns a toda a equipe do abrigo pelo resgate desses inocentes. Vocês são luz!" },
  { name: "Diego Barreto", amount: 350, time: "há 11h", msg: "Valor destinado para a fisioterapia e exames do Bento. Força garoto!" },
  { name: "Helena Ribeiro", amount: 500, time: "há 12h", msg: "Como tutora de resgatados, sei da luta diária. Minha eterna admiração pelo trabalho de vocês." },
  { name: "Doador Anônimo", amount: 30, time: "há 12h", msg: "Que cada peludo sinta o carinho e o aconchego que merece." },
  { name: "Tatiane e Marcos", amount: 100, time: "há 13h", msg: "Para a Mel! Que a cirurgia na coluna seja um sucesso completo." },
  { name: "Leonardo Duarte", amount: 80, time: "há 14h", msg: "Remédios e cuidados veterinários para o Thor. Não deixe de se tratar, amigão!" },
  { name: "Simone Castro", amount: 150, time: "há 15h", msg: "Em memória do meu cãozinho Pipoca, doando com todo amor para salvar vidas no abrigo." },
  { name: "Rogério Martins", amount: 20, time: "há 16h", msg: "Fiz meu PIX! Se todo mundo doar um pouquinho, ninguém passa fome." },
  { name: "Amanda e Sofia", amount: 50, time: "há 17h", msg: "Para encher o pratinho dos bebês e dos idosinhos hoje! ❤️🐾" },
  { name: "Bruno Fontes", amount: 250, time: "há 18h", msg: "Para a cirurgia da Luna. Essa guerreira ainda tem muito amor para dar." },
  { name: "Jéssica Toledo", amount: 100, time: "há 19h", msg: "Cuidem bem da Amora e da Mel! O trabalho de vocês é indispensável." },
  { name: "Doador Anônimo", amount: 50, time: "há 20h", msg: "Parabéns por acolherem tantos cães esquecidos pelo mundo." },
  { name: "Roberto Azevedo", amount: 1000, time: "há 21h", msg: "Doação para ajudar na reforma emergencial dos canis e estoque de ração do mês." },
  { name: "Carolina Freitas", amount: 40, time: "há 22h", msg: "Para comprar vermífugos e curativos para os acolhidos recém-chegados." },
  { name: "Sandra Regina", amount: 120, time: "há 23h", msg: "Que o Bento consiga dar os primeiros passinhos após a fisioterapia! Na torcida." },
  { name: "Paulo Henrique", amount: 50, time: "há 1 dia", msg: "Apoio mensal garantido para os 140 cães. Contem sempre comigo!" },
  { name: "Luísa Fagundes", amount: 200, time: "há 1 dia", msg: "Para a medicação contínua do Thor e exames da Mel. Vocês são heróis." },
  { name: "Família Oliveira", amount: 75, time: "há 1 dia", msg: "Nossos corações estão com cada um desses focinhos amados. Boa recuperação a todos!" },
  { name: "Guilherme Siqueira", amount: 30, time: "há 1 dia", msg: "Todo apoio aos voluntários que acordam cedo para alimentar e limpar os canis." },
  { name: "Denise Moreira", amount: 150, time: "há 2 dias", msg: "Para o tratamento oncológico da Luna. Tenho fé na cura dessa menina!" },
  { name: "André & Carol", amount: 100, time: "há 2 dias", msg: "Para a medicação da Amora. Lindo ver o amor e dedicação do abrigo." },
  { name: "Cláudia Valente", amount: 50, time: "há 2 dias", msg: "Que os 140 cães tenham sempre água limpa, caminha quente e barriga cheia." },
  { name: "Doador Anônimo", amount: 20, time: "há 2 dias", msg: "Ajudando com muito carinho. Força guerreiros da causa animal!" },
];

function DogShelterCampaignPage() {
  const [donors, setDonors] = useState(INITIAL_DONORS);
  const [visibleCount, setVisibleCount] = useState(6);

  // Estados do formulário de PIX
  const [selectedVal, setSelectedVal] = useState<number | null>(20);
  const [customVal, setCustomVal] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorMsg, setDonorMsg] = useState("");

  // Modal do PIX
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [pixValue, setPixValue] = useState(20);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  // Calcula valor final
  const currentDonationAmount = selectedVal !== null ? selectedVal : Number(customVal) || 0;

  const handleGeneratePix = async (valOverride?: number) => {
    const val = valOverride !== undefined ? valOverride : currentDonationAmount;
    if (val < 1) {
      return toast.error("Informe um valor para sua doação.");
    }

    setIsGeneratingPix(true);
    setPixValue(val);
    setConfirmedSuccess(false);

    try {
      const res = await createPromissePix(val);
      if (res && res.pixCode) {
        setPixCode(res.pixCode);
        setQrCodeUrl(res.qrCodeUrl);
        setTransactionId(res.id);
        setPixModalOpen(true);
      }
    } catch (err: any) {
      console.error("[PromissePay] Erro na geração:", err);
      toast.error(err?.message || "Não foi possível gerar a cobrança na PromissePay.");
    } finally {
      setIsGeneratingPix(false);
    }
  };

  // Monitora automaticamente o status do pagamento via API Promisse
  useEffect(() => {
    if (!pixModalOpen || confirmedSuccess || !transactionId || transactionId.startsWith("tx_")) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const status = await checkPromissePixStatus(transactionId);
        if (status === "paid" || status === "completed" || status === "settled") {
          clearInterval(interval);
          handleConfirmPixPayment();
        }
      } catch (e) {
        // Ignora erros de polling momentâneos
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [pixModalOpen, confirmedSuccess, transactionId]);

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    toast.success("Código PIX Copia e Cola copiado!");
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleConfirmPixPayment = () => {
    setConfirmedSuccess(true);

    const newDonor = {
      name: donorName.trim() || "Doador Solidário",
      amount: pixValue,
      time: "agora mesmo",
      msg: donorMsg.trim() || "Doação realizada para o abrigo de cães. ❤️",
    };
    setDonors([newDonor, ...donors]);

    toast.success("Doação registrada! Muito obrigado pelo carinho com os cães! 🐶❤️");
  };

  const handleHelpDog = (name: string) => {
    setDonorMsg(`Ajuda especial para a recuperação do(a) ${name}! ❤️`);
    toast.info(`Você escolheu apoiar ${name}! Escolha o valor da sua doação.`);
    scrollToDonation();
  };

  const scrollToDonation = () => {
    const el = document.getElementById("area-doacao-pix");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      handleGeneratePix();
    }
  };

  return (
    <div className="container-page px-4 py-5 sm:py-8 pb-28 md:pb-14">
      {/* Alerta oficial compacto para mobile e desktop */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2 rounded-2xl bg-primary-soft/80 border border-primary/20 px-3.5 py-2.5 text-xs sm:text-sm text-primary-deep">
        <div className="flex items-center gap-1.5 font-medium">
          <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
          <span>Campanha Oficial do <strong>Abrigo Patas da Esperança</strong></span>
        </div>
        <span className="shrink-0 text-[11px] font-bold bg-primary text-white rounded-full px-2 py-0.5">
          140 Cães
        </span>
      </div>

      {/* Grid Principal: No Mobile o formulário de doação pode ser acessado de imediato */}
      <div className="grid gap-8 lg:grid-cols-[1.1fr_420px] lg:items-start">
        {/* Coluna de Conteúdo (História, Fotos e Transparência) */}
        <div className="space-y-6 sm:space-y-8">
          {/* Título Principal */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-0.5">
                <PawPrint className="h-3 w-3" /> Causa Animal
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Gravataí / RS
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Atualizado hoje
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              140 cães resgatados dependem de você para comer e sobreviver. <span className="text-primary">Não deixe a fome vencer! 🐾</span>
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Campanha contínua da equipe voluntária para garantir ração diária, atendimento veterinário e abrigo seguro.
            </p>
          </div>

          {/* Banner Principal Oficial */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border shadow-lift bg-muted">
            <img
              src="/banner-principal.jpg"
              alt="Resgauto — Abrigo Patas da Esperança: Uma segunda chance pode mudar uma vida"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* ÁREA DE DOAÇÃO NO MOBILE (Aparece logo abaixo da foto para quem estiver no celular) */}
          <div className="block lg:hidden">
            <DonationCard
              selectedVal={selectedVal}
              setSelectedVal={setSelectedVal}
              customVal={customVal}
              setCustomVal={setCustomVal}
              donorName={donorName}
              setDonorName={setDonorName}
              donorMsg={donorMsg}
              setDonorMsg={setDonorMsg}
              currentDonationAmount={currentDonationAmount}
              onGeneratePix={handleGeneratePix}
              isGenerating={isGeneratingPix}
            />
          </div>

          {/* Galeria de Fotos dos Cães */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                <PawPrint className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Alguns dos nossos acolhidos
              </h2>
              <span className="text-xs text-muted-foreground">Conheça as histórias</span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Conheça alguns dos anjinhos resgatados que dependem de tratamento contínuo e cirurgias para sobreviver.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {DOG_GALLERY.map((dog) => (
                <div
                  key={dog.name}
                  className="group rounded-2xl border border-border bg-surface hover:border-primary/40 p-3.5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                      <img
                        src={dog.img}
                        alt={`Foto de ${dog.name}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {dog.tag && (
                        <span className="absolute top-2 left-2 rounded-full bg-rose-600/90 text-white text-[10px] font-bold px-2.5 py-0.5 backdrop-blur-sm shadow-sm flex items-center gap-1">
                          <Heart className="h-2.5 w-2.5 fill-current" /> {dog.tag}
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <h3 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                        {dog.name}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {dog.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold h-8 border-primary/30 text-primary hover:bg-primary hover:text-white transition gap-1.5"
                      onClick={() => handleHelpDog(dog.name)}
                    >
                      <Heart className="h-3.5 w-3.5" /> Ajudar {dog.name}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* A História do Abrigo */}
          <section className="space-y-3.5 rounded-2xl sm:rounded-3xl border border-border bg-surface p-5 sm:p-7">
            <h2 className="text-lg sm:text-xl font-bold">Nossa História & Necessidades Urgentes</h2>
            
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              O <strong>Abrigo Patas da Esperança</strong> acolhe cães que não tinham para onde ir: vítimas de atropelamentos, mãezinhas abandonadas com filhotes e cães idosos que foram descartados.
            </p>

            <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
              Hoje cuidamos de <strong>140 vidas</strong>. O abrigo consome cerca de <strong>60 kg de ração todos os dias</strong>, além de remédios de uso contínuo para dor, vermífugos e curativos.
            </p>

            <div className="my-3 rounded-xl bg-primary-soft p-4 border border-primary/20 space-y-2">
              <h3 className="font-bold text-xs sm:text-sm text-primary-deep flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Principais necessidades mantidas pelas doações:
              </h3>
              <ul className="text-xs sm:text-sm space-y-1.5 text-foreground/85 list-disc pl-4">
                <li><strong>Ração diária</strong> para manter as tigelas cheias de manhã e à noite.</li>
                <li><strong>Clínica veterinária e remédios</strong> para os 45 cães em tratamento intensivo.</li>
                <li><strong>Vacinas anuais</strong> para prevenir cinomose, parvovirose e raiva.</li>
                <li><strong>Manutenção dos canis</strong> com casinhas limpas, secas e protegidas do frio.</li>
              </ul>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Não temos fins lucrativos. Cada centavo doado via PIX é revertido imediatamente para a alimentação e saúde dos animais.
            </p>
          </section>

          {/* Onde sua doação faz a diferença */}
          <section className="rounded-2xl sm:rounded-3xl border border-border bg-surface p-5 sm:p-7">
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> O que sua doação garante aos cães:
            </h3>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-xl border border-border/80 p-3.5 bg-background">
                <p className="font-bold text-xs sm:text-sm text-foreground">🍲 Ração e Nutrição Diária</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Alimentação balanceada de qualidade para filhotes, adultos e idosos.</p>
              </div>
              <div className="rounded-xl border border-border/80 p-3.5 bg-background">
                <p className="font-bold text-xs sm:text-sm text-foreground">🩺 Cuidados Veterinários</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Consultas, cirurgias ortopédicas de resgate e medicamentos para dor.</p>
              </div>
              <div className="rounded-xl border border-border/80 p-3.5 bg-background">
                <p className="font-bold text-xs sm:text-sm text-foreground">🏠 Canis Seguros e Aconchegantes</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Proteção contra chuva e vento, com caminhas quentinhas.</p>
              </div>
              <div className="rounded-xl border border-border/80 p-3.5 bg-background">
                <p className="font-bold text-xs sm:text-sm text-foreground">✨ Higiene e Vacinação</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Vacinas importadas, vermífugos e desinfecção hospitalar dos espaços.</p>
              </div>
            </div>
          </section>

          {/* Mural de Mensagens Solidárias */}
          <section className="rounded-2xl sm:rounded-3xl border border-border bg-surface p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <MessageSquareHeart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Mensagens de Apoio
              </h3>
              <span className="text-xs font-semibold text-primary">{donors.length} recados</span>
            </div>

            <div className="mt-4 space-y-2.5">
              {donors.slice(0, visibleCount).map((d, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-xl border border-border/70 p-3 bg-background text-xs transition hover:border-primary/30">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary font-bold text-xs">
                    {d.name.charAt(0)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground">{d.name}</span>
                        {d.amount > 0 && (
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                            <Heart className="h-2.5 w-2.5 fill-emerald-600 dark:fill-emerald-400" /> Doou R$ {d.amount}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{d.time}</span>
                    </div>
                    <p className="text-muted-foreground mt-1 leading-relaxed">{d.msg}</p>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < donors.length ? (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-xs text-primary border-primary/30 hover:bg-primary-soft font-semibold gap-1.5"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 10, donors.length))}
                >
                  <ChevronDown className="h-3.5 w-3.5" /> Ver mais 10 recados ({donors.length - visibleCount} restantes)
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground font-semibold"
                  onClick={() => setVisibleCount(donors.length)}
                >
                  Ver todos os {donors.length}
                </Button>
              </div>
            ) : donors.length > 6 ? (
              <div className="mt-4 text-center pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                  onClick={() => setVisibleCount(6)}
                >
                  Mostrar menos recados
                </Button>
              </div>
            ) : null}
          </section>

          {/* Localização do Abrigo */}
          <section className="rounded-2xl sm:rounded-3xl border border-border bg-surface p-5 sm:p-7">
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Nossa Localização
            </h3>

            {/* Mapa fake estilizado */}
            <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm" style={{ height: 220 }}>
              <svg
                viewBox="0 0 420 220"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                style={{ background: "#e8f0e4" }}
              >
                {/* Fundo verde claro (área verde/parques) */}
                <rect x="0" y="0" width="420" height="220" fill="#e8f0e4" />

                {/* Quarteirões — cinza claro */}
                <rect x="0"   y="0"   width="80"  height="70"  fill="#d9e5d5" rx="3"/>
                <rect x="100" y="0"   width="100" height="70"  fill="#d9e5d5" rx="3"/>
                <rect x="220" y="0"   width="90"  height="70"  fill="#d9e5d5" rx="3"/>
                <rect x="330" y="0"   width="90"  height="70"  fill="#d9e5d5" rx="3"/>

                <rect x="0"   y="90"  width="80"  height="60"  fill="#d9e5d5" rx="3"/>
                <rect x="100" y="90"  width="100" height="60"  fill="#d9e5d5" rx="3"/>
                <rect x="220" y="90"  width="90"  height="60"  fill="#d9e5d5" rx="3"/>
                <rect x="330" y="90"  width="90"  height="60"  fill="#d9e5d5" rx="3"/>

                <rect x="0"   y="170" width="80"  height="50"  fill="#d9e5d5" rx="3"/>
                <rect x="100" y="170" width="100" height="50"  fill="#d9e5d5" rx="3"/>
                <rect x="220" y="170" width="90"  height="50"  fill="#d9e5d5" rx="3"/>
                <rect x="330" y="170" width="90"  height="50"  fill="#d9e5d5" rx="3"/>

                {/* Ruas horizontais */}
                <rect x="0"  y="72"  width="420" height="16" fill="#ffffff" />
                <rect x="0"  y="152" width="420" height="16" fill="#ffffff" />

                {/* Ruas verticais */}
                <rect x="82"  y="0" width="16" height="220" fill="#ffffff" />
                <rect x="202" y="0" width="16" height="220" fill="#ffffff" />
                <rect x="312" y="0" width="16" height="220" fill="#ffffff" />

                {/* Linha do meio das ruas — tracejada */}
                <line x1="0" y1="80" x2="420" y2="80" stroke="#f0c040" strokeWidth="1" strokeDasharray="8,8" opacity="0.5"/>
                <line x1="0" y1="160" x2="420" y2="160" stroke="#f0c040" strokeWidth="1" strokeDasharray="8,8" opacity="0.5"/>
                <line x1="90" y1="0" x2="90" y2="220" stroke="#f0c040" strokeWidth="1" strokeDasharray="8,8" opacity="0.5"/>
                <line x1="210" y1="0" x2="210" y2="220" stroke="#f0c040" strokeWidth="1" strokeDasharray="8,8" opacity="0.5"/>
                <line x1="320" y1="0" x2="320" y2="220" stroke="#f0c040" strokeWidth="1" strokeDasharray="8,8" opacity="0.5"/>

                {/* Labels de rua */}
                <text x="110" y="84" fontSize="7" fill="#888" fontFamily="sans-serif">R. das Acácias</text>
                <text x="225" y="164" fontSize="7" fill="#888" fontFamily="sans-serif">Av. Dom Pedro II</text>
                <text x="86" y="45" fontSize="6" fill="#888" fontFamily="sans-serif" transform="rotate(90,91,50)">R. dos Ipês</text>

                {/* Pequenos edifícios */}
                <rect x="10"  y="10"  width="30" height="20" fill="#c2d4bc" rx="2"/>
                <rect x="50"  y="8"   width="22" height="24" fill="#b8cdb2" rx="2"/>
                <rect x="110" y="12"  width="35" height="18" fill="#c2d4bc" rx="2"/>
                <rect x="155" y="8"   width="28" height="22" fill="#b8cdb2" rx="2"/>
                <rect x="230" y="10"  width="40" height="20" fill="#c2d4bc" rx="2"/>
                <rect x="340" y="8"   width="30" height="24" fill="#b8cdb2" rx="2"/>
                <rect x="380" y="12"  width="32" height="18" fill="#c2d4bc" rx="2"/>

                <rect x="10"  y="100" width="25" height="18" fill="#c2d4bc" rx="2"/>
                <rect x="42"  y="98"  width="32" height="22" fill="#b8cdb2" rx="2"/>
                <rect x="110" y="102" width="40" height="16" fill="#c2d4bc" rx="2"/>
                <rect x="160" y="100" width="28" height="20" fill="#b8cdb2" rx="2"/>
                <rect x="340" y="100" width="35" height="18" fill="#c2d4bc" rx="2"/>
                <rect x="380" y="102" width="28" height="20" fill="#b8cdb2" rx="2"/>

                <rect x="10"  y="180" width="28" height="22" fill="#c2d4bc" rx="2"/>
                <rect x="46"  y="178" width="25" height="20" fill="#b8cdb2" rx="2"/>
                <rect x="110" y="180" width="40" height="18" fill="#c2d4bc" rx="2"/>
                <rect x="340" y="180" width="30" height="22" fill="#c2d4bc" rx="2"/>

                {/* Praça central */}
                <rect x="226" y="96" width="84" height="52" fill="#b8d9a8" rx="4"/>
                <circle cx="268" cy="122" r="14" fill="#9bc98a" />
                <text x="268" y="125" fontSize="7" fill="#4a7a3a" textAnchor="middle" fontFamily="sans-serif">Praça</text>

                {/* Pino de localização do abrigo — centro-esquerda */}
                <g transform="translate(148,75)">
                  {/* Sombra */}
                  <ellipse cx="0" cy="38" rx="9" ry="4" fill="rgba(0,0,0,0.18)" />
                  {/* Corpo do pino */}
                  <path d="M0,36 C-14,-2 -18,-20 0,-26 C18,-20 14,-2 0,36 Z" fill="#e53935"/>
                  {/* Círculo interno */}
                  <circle cx="0" cy="-12" r="8" fill="#ffffff"/>
                  <text x="0" y="-9" fontSize="10" textAnchor="middle" fill="#e53935">🐾</text>
                </g>

                {/* Balão de nome */}
                <g transform="translate(148,75)">
                  <rect x="-52" y="-56" width="104" height="24" rx="6" fill="#e53935" opacity="0.95"/>
                  <polygon points="-6,-32 6,-32 0,-24" fill="#e53935" opacity="0.95"/>
                  <text x="0" y="-40" fontSize="7.5" fontWeight="bold" fill="#ffffff" textAnchor="middle" fontFamily="sans-serif">Abrigo Patas da Esperança</text>
                  <text x="0" y="-30" fontSize="6" fill="#ffcccc" textAnchor="middle" fontFamily="sans-serif">R. das Acácias, 320 – Gravataí/RS</text>
                </g>

                {/* Marca d'água estilo Google Maps */}
                <text x="370" y="215" fontSize="7.5" fill="#aaa" fontFamily="sans-serif" textAnchor="end">© Mapa ilustrativo</text>
              </svg>

              {/* Controles fake de zoom */}
              <div className="absolute right-2 top-2 flex flex-col gap-px">
                <button disabled className="w-7 h-7 bg-white shadow border border-border/60 rounded-t-md text-base font-bold text-muted-foreground flex items-center justify-center select-none cursor-default">+</button>
                <button disabled className="w-7 h-7 bg-white shadow border border-border/60 rounded-b-md text-base font-bold text-muted-foreground flex items-center justify-center select-none cursor-default">−</button>
              </div>
            </div>

            {/* Endereço e horário */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Rua das Acácias, 320</p>
                  <p className="text-xs text-muted-foreground">Bairro Verde Esperança – Gravataí / RS</p>
                  <p className="text-xs text-muted-foreground">CEP 94000-320</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Visitas com agendamento</p>
                  <p className="text-xs text-muted-foreground">Seg–Sex: 9h às 17h</p>
                  <p className="text-xs text-muted-foreground">Sáb: 9h às 13h</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Coluna da Direita (Desktop): Card Flutuante de Doação */}
        <div className="hidden lg:block space-y-6">
          <aside className="sticky top-24">
            <DonationCard
              selectedVal={selectedVal}
              setSelectedVal={setSelectedVal}
              customVal={customVal}
              setCustomVal={setCustomVal}
              donorName={donorName}
              setDonorName={setDonorName}
              donorMsg={donorMsg}
              setDonorMsg={setDonorMsg}
              currentDonationAmount={currentDonationAmount}
              onGeneratePix={handleGeneratePix}
              isGenerating={isGeneratingPix}
            />
          </aside>
        </div>
      </div>

      {/* BARRA FIXA INFERIOR NO MOBILE: Doação acessível em 1 toque de qualquer ponto */}
      <div className="fixed bottom-0 inset-x-0 z-40 block lg:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 py-3 shadow-lift">
        <div className="flex items-center justify-between gap-3">
          <div className="leading-tight">
            <p className="text-xs font-bold text-foreground">Ajude os 140 cães</p>
            <p className="text-[11px] text-muted-foreground">Doe qualquer valor via PIX</p>
          </div>
          <Button
            size="lg"
            className="font-extrabold shadow-md text-sm h-11 px-5 gap-1.5 shrink-0"
            onClick={scrollToDonation}
          >
            <QrCode className="h-4 w-4" /> Doar via PIX
          </Button>
        </div>
      </div>

      {/* MODAL DO PIX GERADO (Totalmente adaptado para Mobile e Desktop) */}
      <Dialog open={pixModalOpen} onOpenChange={setPixModalOpen}>
        <DialogContent className="w-[94vw] max-w-md p-5 sm:p-6 rounded-2xl sm:rounded-3xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" /> Doação via PIX Instantâneo
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Escaneie o QR Code ou copie o código Pix abaixo no app do seu banco para doar para o <strong>Abrigo Patas da Esperança</strong>.
            </DialogDescription>
          </DialogHeader>

          {!confirmedSuccess ? (
            <div className="space-y-4 text-center mt-1">
              {/* QR Code Responsivo da PromissePay */}
              <div className="mx-auto flex h-48 w-48 sm:h-52 sm:w-52 items-center justify-center rounded-2xl border-2 border-primary/30 bg-white p-2.5 shadow-inner">
                <img
                  src={qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixCode)}`}
                  alt="QR Code do Pix"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-primary flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Pagamento Seguro via PromissePay
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O nome do favorecido e o valor exato aparecerão na confirmação do seu banco.
                </p>
              </div>

              {/* Campo Copia e Cola */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-muted-foreground">Código PIX Copia e Cola:</label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={pixCode}
                    className="font-mono text-xs select-all h-10"
                  />
                  <Button onClick={handleCopyPix} className="gap-1 shrink-0 h-10 px-3.5">
                    {copiedPix ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedPix ? "Copiado!" : "Copiar"}
                  </Button>
                </div>
              </div>

              {/* Botão de confirmação de pagamento */}
              <div className="pt-1">
                <Button
                  size="lg"
                  className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-11 text-sm sm:text-base"
                  onClick={handleConfirmPixPayment}
                >
                  <Check className="h-4 w-4" /> Já realizei meu PIX!
                </Button>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1.5">
                  Clique acima após transferir para registrar sua ajuda no mural.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-5 text-center space-y-3">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/20 text-emerald-600">
                <Heart className="h-7 w-7 fill-emerald-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground">Muito Obrigado!</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
                Em nome dos <strong>140 cãezinhos</strong> do Abrigo Patas da Esperança, nossa imensa gratidão!
              </p>
              <div className="rounded-xl bg-primary-soft p-3 text-xs text-primary-deep font-semibold">
                Sua ajuda garante ração e cuidados para quem mais precisa.
              </div>
              <Button onClick={() => setPixModalOpen(false)} className="w-full h-11">
                Voltar à página
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente do Card de Doação (reutilizado de forma limpa para Mobile e Desktop)
function DonationCard({
  selectedVal,
  setSelectedVal,
  customVal,
  setCustomVal,
  donorName,
  setDonorName,
  donorMsg,
  setDonorMsg,
  currentDonationAmount,
  onGeneratePix,
  isGenerating,
}: {
  selectedVal: number | null;
  setSelectedVal: (v: number | null) => void;
  customVal: string;
  setCustomVal: (v: string) => void;
  donorName: string;
  setDonorName: (v: string) => void;
  donorMsg: string;
  setDonorMsg: (v: string) => void;
  currentDonationAmount: number;
  onGeneratePix: () => void;
  isGenerating?: boolean;
}) {
  return (
    <div id="area-doacao-pix" className="card-elevated overflow-hidden p-5 sm:p-6 border-primary/30 shadow-lift">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" /> Doar via PIX ao Abrigo
        </h3>
        <span className="rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] px-2 py-0.5 uppercase">
          Sem taxas
        </span>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Escolha uma opção ou informe qualquer valor para gerar o código PIX:
      </p>

      {/* Seletores rápidos de valor */}
      <div className="mt-3.5 grid grid-cols-2 gap-2">
        {PRESET_AMOUNTS.map((p) => (
          <button
            key={p.val}
            type="button"
            onClick={() => {
              setSelectedVal(p.val);
              setCustomVal("");
            }}
            className={`rounded-xl border p-2.5 text-left transition-all min-h-[56px] flex flex-col justify-center ${
              selectedVal === p.val
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-surface hover:border-primary/50 text-foreground"
            }`}
          >
            <p className="font-extrabold text-sm sm:text-base leading-none">{p.label}</p>
            <p className={`text-[10px] mt-1 line-clamp-1 ${selectedVal === p.val ? "text-white/90" : "text-muted-foreground"}`}>
              {p.impact}
            </p>
          </button>
        ))}
      </div>

      {/* Campo de Outro Valor */}
      <div className="mt-3">
        <label className="text-xs font-semibold text-muted-foreground">Ou digite outro valor (R$):</label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">R$</span>
          <Input
            type="number"
            placeholder="Qualquer valor, ex: 150 ou 1000"
            min="1"
            step="5"
            value={customVal}
            onChange={(e) => {
              setCustomVal(e.target.value);
              setSelectedVal(null);
            }}
            className="h-11 pl-9 text-base font-semibold"
          />
        </div>
      </div>

      {/* Identificação e Recado (opcionais) */}
      <div className="mt-3 space-y-2">
        <Input
          placeholder="Seu nome (ou deixe vazio para anônimo)"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          className="h-10 text-xs sm:text-sm"
          maxLength={50}
        />
        <Input
          placeholder="Deixe uma mensagem de carinho aos cães..."
          value={donorMsg}
          onChange={(e) => setDonorMsg(e.target.value)}
          className="h-10 text-xs sm:text-sm"
          maxLength={100}
        />
      </div>

      {/* BOTÃO GERAR PIX */}
      <Button
        size="lg"
        disabled={isGenerating}
        className="mt-4 w-full text-sm sm:text-base font-extrabold shadow-md gap-2 h-12"
        onClick={onGeneratePix}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Gerando PIX na PromissePay...
          </>
        ) : (
          <>
            <QrCode className="h-5 w-5" />
            {currentDonationAmount > 0 ? `Gerar PIX de R$ ${currentDonationAmount}` : "Gerar PIX para o Abrigo"}
          </>
        )}
      </Button>

      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        100% da doação é revertida em ração e tratamentos.
      </p>

      {/* Compartilhar */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 text-xs"
            onClick={() => {
              navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
              toast.success("Link copiado!");
            }}
          >
            <Copy className="mr-1 h-3.5 w-3.5" /> Copiar Link
          </Button>
        </div>
      </div>
    </div>
  );
}
