import heroBg from "@/assets/hero-bg.jpg";
import { ChevronDown } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="InkFox Hero"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background" />
      </div>

      {/* Glitch Lines Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="glitch-line absolute top-1/4 left-0 right-0" />
        <div className="glitch-line absolute top-2/3 left-0 right-0" style={{ animationDelay: "2s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="editorial-text text-sm md:text-base text-muted-foreground mb-4 animate-fade-up">
          Boutique Storytelling & Publishing
        </p>
        
        <h1 className="font-display text-7xl md:text-9xl lg:text-[12rem] leading-none mb-6 animate-fade-up-delay-1">
          <span className="text-foreground">INK</span>
          <span className="text-neon animate-neon-pulse">FOX</span>
        </h1>

        <p className="font-body text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-12 animate-fade-up-delay-2">
          Where dark narratives meet luminous design. Discover stories that glow in the urban night.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up-delay-2">
          <a
            href="#books"
            className="px-8 py-4 bg-primary text-primary-foreground font-display text-lg tracking-wider hover:shadow-[var(--neon-glow-strong)] transition-shadow"
          >
            Explore Stories
          </a>
          <a
            href="#about"
            className="px-8 py-4 border border-foreground/30 text-foreground font-display text-lg tracking-wider hover:border-primary hover:text-primary transition-colors"
          >
            Our Universe
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <a
        href="#books"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors animate-bounce"
      >
        <ChevronDown size={32} />
      </a>
    </section>
  );
};

export default Hero;
