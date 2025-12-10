"use client";
import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SITE_PASSWORD = "PerArdua";
const AUTH_KEY = "hba_site_authenticated";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const isAuth = typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "true";
    setIsAuthenticated(isAuth);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // Small delay for UX
    setTimeout(() => {
      if (password === SITE_PASSWORD) {
        sessionStorage.setItem(AUTH_KEY, "true");
        setIsAuthenticated(true);
      } else {
        setError(true);
        setPassword("");
      }
      setIsLoading(false);
    }, 300);
  }

  // Show nothing while checking auth status (prevents flash)
  if (isAuthenticated === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <Image 
            src="/hba-logo.png" 
            alt="Loading..." 
            width={60} 
            height={60}
            className="rounded-full opacity-50"
          />
        </div>
      </div>
    );
  }

  // Show password gate if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/30 px-4">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150" />
                <Image 
                  src="/hba-logo.png" 
                  alt="High Bluff Academy Foundation" 
                  width={80} 
                  height={80}
                  className="relative rounded-full shadow-lg"
                  priority
                />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2">
              High Bluff Academy Foundation
            </h1>
            <p className="text-muted-foreground">
              Pathways to Global Learning
            </p>
          </div>

          {/* Password form card */}
          <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <LockIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Welcome
              </h2>
              <p className="text-sm text-muted-foreground">
                Please enter the access password to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  className={`
                    h-12 text-center text-lg tracking-wider
                    transition-all duration-200
                    ${error 
                      ? "border-destructive ring-2 ring-destructive/20 focus-visible:ring-destructive/40" 
                      : "focus-visible:ring-primary/40"
                    }
                  `}
                  autoFocus
                  autoComplete="off"
                />
                {error && (
                  <p className="text-sm text-destructive text-center animate-in fade-in slide-in-from-top-1 duration-200">
                    Incorrect password. Please try again.
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 transition-all duration-200"
                disabled={!password || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UnlockIcon className="w-4 h-4" />
                    Enter Site
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground/60 mt-6">
            This site contains curated scholarship information for Afghan students
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated, show the app
  return <>{children}</>;
}

// Icons
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function UnlockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
