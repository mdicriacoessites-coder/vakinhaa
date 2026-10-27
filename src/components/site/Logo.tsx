import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Vakinha — início">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 6l7 13 7-13" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-foreground">vakinha</span>
    </Link>
  );
}
