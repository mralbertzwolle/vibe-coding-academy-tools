import { Mail, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer id="about" className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-display text-3xl tracking-wider text-foreground">
                INK
              </span>
              <span className="font-display text-3xl tracking-wider text-neon">
                FOX
              </span>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              A boutique publishing house crafting dark, beautiful stories 
              that illuminate the shadows of the urban landscape.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-4 tracking-wider">
              NAVIGATE
            </h4>
            <ul className="space-y-2">
              {["Books", "Universes", "Prints", "Submissions", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-4 tracking-wider">
              STAY CONNECTED
            </h4>
            <p className="font-body text-sm text-muted-foreground mb-4">
              Join our mailing list for exclusive releases and behind-the-scenes content.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 bg-input border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground font-display tracking-wider hover:shadow-[var(--neon-glow)] transition-shadow">
                JOIN
              </button>
            </div>

            {/* Socials */}
            <div className="flex gap-4 mt-6">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Twitter, label: "Twitter" },
                { icon: Mail, label: "Email" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-10 h-10 flex items-center justify-center border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-muted-foreground">
            © 2024 InkFox Publishing. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
