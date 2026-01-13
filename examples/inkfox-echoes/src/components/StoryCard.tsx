interface StoryCardProps {
  image: string;
  title: string;
  subtitle: string;
  category: string;
  className?: string;
}

const StoryCard = ({ image, title, subtitle, category, className = "" }: StoryCardProps) => {
  return (
    <article className={`story-card group cursor-pointer ${className}`}>
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        {/* Category Badge */}
        <span className="absolute top-4 left-4 px-3 py-1 text-xs font-body tracking-widest uppercase bg-primary/90 text-primary-foreground">
          {category}
        </span>

        {/* Neon Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-2xl text-foreground group-hover:text-primary transition-colors mb-2">
          {title}
        </h3>
        <p className="font-body text-sm text-muted-foreground line-clamp-2">
          {subtitle}
        </p>
      </div>
    </article>
  );
};

export default StoryCard;
