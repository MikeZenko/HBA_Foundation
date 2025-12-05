"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { scholarships } from "@/lib/data";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <a 
        href="#main" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handleDown);
    return () => document.removeEventListener("keydown", handleDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image 
              src="/hba-logo.png" 
              alt="HBA Foundation" 
              width={40} 
              height={40}
              className="rounded-full"
            />
            <span className="font-semibold text-foreground hidden sm:block">
              HBA Foundation
            </span>
          </Link>

          {/* Search bar - Desktop */}
          <button 
            onClick={() => setSearchOpen(true)} 
            className="hidden md:flex flex-1 max-w-md items-center gap-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted transition-colors rounded-lg px-4 py-2 border border-border/50"
          >
            <SearchIcon className="h-4 w-4" />
            <span>Search scholarships...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-60">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/scholarships">Scholarships</NavLink>
            <NavLink href="/guide">Guide</NavLink>
            <NavLink href="/contribute">Contribute</NavLink>
            <Button asChild size="sm" className="ml-2 bg-primary hover:bg-primary/90">
              <Link href="/scholarships">Explore</Link>
            </Button>
          </nav>

          {/* Mobile menu */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground"
              aria-label="Search"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2 text-muted-foreground hover:text-foreground" aria-label="Menu">
                  <MenuIcon className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <Image 
                      src="/hba-logo.png" 
                      alt="HBA Foundation" 
                      width={32} 
                      height={32}
                      className="rounded-full"
                    />
                    HBA Foundation
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-2">
                  <MobileNavLink href="/" active={pathname === "/"}>Home</MobileNavLink>
                  <MobileNavLink href="/scholarships" active={pathname.startsWith("/scholarships")}>Scholarships</MobileNavLink>
                  <MobileNavLink href="/guide" active={pathname === "/guide"}>Application Guide</MobileNavLink>
                  <MobileNavLink href="/contribute" active={pathname === "/contribute"}>Contribute</MobileNavLink>
                  <MobileNavLink href="/admin" active={pathname === "/admin"}>Admin</MobileNavLink>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <CommandK open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
  
  return (
    <Link 
      href={href} 
      className={`
        text-sm font-medium px-3 py-2 rounded-lg transition-colors
        ${isActive 
          ? 'bg-primary/10 text-primary' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }
      `}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={`
        text-base font-medium px-4 py-3 rounded-lg transition-colors
        ${active 
          ? 'bg-primary/10 text-primary' 
          : 'text-foreground hover:bg-muted'
        }
      `}
    >
      {children}
    </Link>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image 
                src="/hba-logo.png" 
                alt="HBA Foundation" 
                width={36} 
                height={36}
                className="rounded-full"
              />
              <span className="font-semibold text-foreground">HBA Foundation</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting Afghan students with educational opportunities worldwide. Verified resources, trusted guidance.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/scholarships" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Browse Scholarships
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Application Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Community</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contribute" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Submit Opportunity
                </Link>
              </li>
              <li>
                <a href="mailto:info@hbafoundation.org" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Important</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Always verify scholarship details on official websites before applying. Information is provided for guidance only.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} High Bluff Academy Foundation. Made with care for learners.
          </p>
        </div>
      </div>
    </footer>
  );
}

function CommandK({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search scholarships, pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Scholarships">
          {scholarships.slice(0, 6).map((s) => (
            <CommandItem key={s.id} asChild onSelect={() => onOpenChange(false)}>
              <Link href={`/scholarships/${s.slug}`} className="flex items-center gap-2">
                <GraduationIcon className="h-4 w-4 text-muted-foreground" />
                {s.title}
              </Link>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Pages">
          <CommandItem asChild onSelect={() => onOpenChange(false)}>
            <Link href="/scholarships" className="flex items-center gap-2">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
              Browse All Scholarships
            </Link>
          </CommandItem>
          <CommandItem asChild onSelect={() => onOpenChange(false)}>
            <Link href="/guide" className="flex items-center gap-2">
              <BookIcon className="h-4 w-4 text-muted-foreground" />
              Application Guide
            </Link>
          </CommandItem>
          <CommandItem asChild onSelect={() => onOpenChange(false)}>
            <Link href="/contribute" className="flex items-center gap-2">
              <HeartIcon className="h-4 w-4 text-muted-foreground" />
              Contribute
            </Link>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function GraduationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}
