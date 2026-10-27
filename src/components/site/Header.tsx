import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  const navLink = "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />

        </div>
        <div className="hidden items-center gap-2 md:flex">
          {user && (
            <>
              {isAdmin && (
                <Button variant="ghost" size="sm" asChild><Link to="/admin"><ShieldCheck />Admin</Link></Button>
              )}
              <Button variant="ghost" size="sm" asChild><Link to="/painel"><LayoutDashboard />Meu painel</Link></Button>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair"><LogOut /></Button>
            </>
          )}
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Abrir menu"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="mt-8 flex flex-col gap-1" onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}>
              {user && (
                <>
                  <Link to="/painel" className="rounded-lg px-3 py-3 font-medium hover:bg-primary-soft">Meu painel</Link>
                  {isAdmin && <Link to="/admin" className="rounded-lg px-3 py-3 font-medium hover:bg-primary-soft">Admin</Link>}
                  <button onClick={signOut} className="rounded-lg px-3 py-3 text-left font-medium hover:bg-primary-soft">Sair</button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
