import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { PAGES } from "@/lib/pages";

const groups: { title: string; slugs: (keyof typeof PAGES)[] }[] = [
  { title: "Vakinha", slugs: ["sobre", "ajuda"] },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">Juntos, podemos transformar histórias.</p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h4 className="mb-3 text-sm font-bold">{g.title}</h4>
            <ul className="space-y-2">
              {g.slugs.map((s) => (
                <li key={s}>
                  <Link to="/p/$slug" params={{ slug: s }} className="text-sm text-muted-foreground hover:text-primary-deep">
                    {PAGES[s].title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-page py-5 text-xs text-muted-foreground">© {new Date().getFullYear()} Vakinha. Todos os direitos reservados.</div>
      </div>
    </footer>
  );
}
