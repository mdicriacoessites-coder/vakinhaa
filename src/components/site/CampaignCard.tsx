import { Link } from "@tanstack/react-router";
import { BadgeCheck, Users, ImageOff } from "lucide-react";
import type { Campaign } from "@/lib/campaigns";
import { formatBRL, progressPercent } from "@/lib/format";
import { Progress } from "@/components/ui/progress";

export function CampaignCard({ c }: { c: Campaign }) {
  const pct = progressPercent(c.raised_amount, c.goal_amount);
  return (
    <Link
      to="/v/$slug"
      params={{ slug: c.slug }}
      className="group card-elevated flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {c.cover_url ? (
          <img src={c.cover_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground"><ImageOff /></div>
        )}
        {c.status === "closed" && (
          <span className="absolute left-3 top-3 rounded-full bg-background/95 px-2.5 py-1 text-xs font-semibold">Encerrada</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug">{c.title}</h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          por {c.organizer_name || "Organizador"}
          {c.identity_verified && <BadgeCheck className="h-4 w-4 text-primary" aria-label="Identidade verificada" />}
        </p>
        <div className="mt-auto space-y-2 pt-2">
          <Progress value={pct} className="h-2 bg-primary-soft" />
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-bold text-foreground">{formatBRL(c.raised_amount)}</span>
            <span className="text-muted-foreground">de {formatBRL(c.goal_amount)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{c.supporters_count} apoiadores</span>
            <span className="font-semibold text-primary-deep">{pct}%</span>
          </div>
        </div>
        <span className="mt-1 text-sm font-semibold text-primary group-hover:text-primary-deep">Conhecer campanha →</span>
      </div>
    </Link>
  );
}

export function CampaignCardSkeleton() {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-2 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
