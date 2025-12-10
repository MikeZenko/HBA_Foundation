import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
      <div className="text-center max-w-3xl mx-auto px-4 space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image 
            src="/hba-logo.png" 
            alt="High Bluff Academy Foundation" 
            width={120} 
            height={120}
            className="rounded-full"
            priority
          />
        </div>

        {/* Main headline */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
            Your Future Starts Here
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            A curated collection of scholarships and educational opportunities built specifically for you.
          </p>
        </div>

        {/* Inspirational message */}
        <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed max-w-xl mx-auto">
          Education is the most powerful tool for change. This platform exists to help Afghan women access 
          opportunities that can transform their lives and communities. Every scholarship here has been 
          carefully vetted to support your journey.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-base px-8">
            <Link href="/scholarships">
              Explore Scholarships
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base px-8">
            <Link href="/guide">
              Application Guide
            </Link>
          </Button>
        </div>

        {/* Subtle footer note */}
        <p className="text-sm text-muted-foreground/60 pt-8">
          High Bluff Academy Foundation
        </p>
      </div>
    </div>
  );
}
