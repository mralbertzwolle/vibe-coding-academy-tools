import StoryCard from "./StoryCard";
import bookCover1 from "@/assets/book-cover-1.jpg";
import bookCover2 from "@/assets/book-cover-2.jpg";
import bookCover3 from "@/assets/book-cover-3.jpg";
import print1 from "@/assets/print-1.jpg";
import print2 from "@/assets/print-2.jpg";

const books = [
  {
    image: bookCover1,
    title: "Shadows of Neon",
    subtitle: "A noir thriller set in the flickering underbelly of a city that never sleeps.",
    category: "Novel",
  },
  {
    image: bookCover2,
    title: "Electric Dreams",
    subtitle: "Lost souls navigate the maze of towering lights and forgotten alleys.",
    category: "Anthology",
  },
  {
    image: bookCover3,
    title: "The Watcher",
    subtitle: "Something observes from beyond the geometric veil of our reality.",
    category: "Graphic Novel",
  },
];

const universes = [
  {
    image: print1,
    title: "Noir City",
    subtitle: "An interconnected world of rain-slicked streets and desperate heroes.",
    category: "Universe",
  },
];

const prints = [
  {
    image: print2,
    title: "Ink Burst",
    subtitle: "Limited edition giclée print on archival paper. Edition of 50.",
    category: "Art Print",
  },
];

const StoryGrid = () => {
  return (
    <div className="bg-background">
      {/* Books Section */}
      <section id="books" className="py-24 border-b border-border">
        <div className="container mx-auto px-6">
          <header className="mb-16">
            <span className="editorial-text text-sm text-primary mb-2 block">
              01 — Publications
            </span>
            <h2 className="font-display text-5xl md:text-7xl text-foreground">
              BOOKS
            </h2>
            <div className="w-24 h-px bg-primary mt-6" />
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book, index) => (
              <StoryCard key={index} {...book} />
            ))}
          </div>
        </div>
      </section>

      {/* Universes Section */}
      <section id="universes" className="py-24 border-b border-border">
        <div className="container mx-auto px-6">
          <header className="mb-16">
            <span className="editorial-text text-sm text-primary mb-2 block">
              02 — Story Worlds
            </span>
            <h2 className="font-display text-5xl md:text-7xl text-foreground">
              UNIVERSES
            </h2>
            <div className="w-24 h-px bg-primary mt-6" />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {universes.map((universe, index) => (
              <StoryCard 
                key={index} 
                {...universe} 
                className="lg:col-span-1"
              />
            ))}
            
            {/* Universe Description Card */}
            <div className="flex flex-col justify-center p-8 lg:p-12 bg-card border border-border">
              <p className="font-body text-xl text-foreground/80 leading-relaxed mb-6">
                Our universes are interconnected story worlds where characters cross paths 
                and narratives interweave. Each book adds a new thread to the tapestry.
              </p>
              <a 
                href="#" 
                className="inline-flex items-center gap-2 text-primary font-body text-sm tracking-wider uppercase hover:gap-4 transition-all"
              >
                Explore All Universes
                <span className="text-lg">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Prints Section */}
      <section id="prints" className="py-24">
        <div className="container mx-auto px-6">
          <header className="mb-16">
            <span className="editorial-text text-sm text-primary mb-2 block">
              03 — Limited Editions
            </span>
            <h2 className="font-display text-5xl md:text-7xl text-foreground">
              PRINTS
            </h2>
            <div className="w-24 h-px bg-primary mt-6" />
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {prints.map((print, index) => (
              <StoryCard key={index} {...print} />
            ))}
            
            {/* Coming Soon Card */}
            <div className="story-card flex flex-col items-center justify-center aspect-[3/4] border-dashed">
              <span className="font-display text-4xl text-muted-foreground mb-2">+</span>
              <span className="editorial-text text-sm text-muted-foreground">
                More Coming Soon
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StoryGrid;
