import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import StoryGrid from "@/components/StoryGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <StoryGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
