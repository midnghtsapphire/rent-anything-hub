import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Shield, Zap, Users, MapPin, Search, Sparkles, ArrowRight, RefreshCw, Star, Package } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";

const CATEGORIES = [
  { name: "Generators", icon: "⚡", slug: "generators", desc: "Power when you need it" },
  { name: "Tools", icon: "🔧", slug: "tools", desc: "Build anything" },
  { name: "Vehicles", icon: "🚗", slug: "vehicles", desc: "Go anywhere" },
  { name: "Events", icon: "🎉", slug: "events", desc: "Make it memorable" },
  { name: "Home", icon: "🏠", slug: "home", desc: "Upgrade your space" },
  { name: "Safety", icon: "🦺", slug: "safety", desc: "Stay protected" },
  { name: "Weird Vault", icon: "🌀", slug: "weird", desc: "The unexplainable" },
  { name: "Other", icon: "📦", slug: "other", desc: "Everything else" },
];

const WEIRD_VAULT_ITEMS = [
  { title: "Emotional Support Goat", price: "$45/day", desc: "Certified therapy goat. Surprisingly good listener. Will eat your anxiety (and your garden).", emoji: "🐐", badge: "Most Rented" },
  { title: "Haunted Mirror (Allegedly)", price: "$12/day", desc: "Shows reflections 3 seconds delayed. Previous renter reported seeing their future self. Not our problem.", emoji: "🪞", badge: "Weird Vault" },
  { title: "Astronaut Suit (Replica)", price: "$89/day", desc: "NASA-accurate replica. Perfect for grocery runs, first dates, or existential crises. Helmet included.", emoji: "👨‍🚀", badge: "Fan Favorite" },
  { title: "Vintage Lie Detector", price: "$35/day", desc: "1970s polygraph. Works great for family dinners. Accuracy: 60%. Drama: 100%.", emoji: "📊", badge: "Trending" },
  { title: "Fog Machine (Industrial)", price: "$28/day", desc: "Creates 500 sq ft of dense fog. Ideal for dramatic entrances, escapes, or hiding from responsibilities.", emoji: "🌫️", badge: "Popular" },
  { title: "Taxidermied Raccoon (Named Steve)", price: "$8/day", desc: "Steve has been to 47 weddings. He is a great plus-one. Does not eat, does not judge.", emoji: "🦝", badge: "Weird Vault" },
];

const TRUST_FEATURES = [
  { icon: Shield, title: "Verified Listings", desc: "Every listing reviewed. Flagged items removed within 24 hours.", color: "text-green-400" },
  { icon: Sparkles, title: "AI Fair Pricing", desc: "Our engine flags overpriced listings before you even ask.", color: "text-primary" },
  { icon: Leaf, title: "CO2 Tracked", desc: "Every rental calculates carbon saved vs buying new. Real numbers.", color: "text-green-400" },
  { icon: Zap, title: "Emergency Mode", desc: "Disaster gear surfaces instantly. Price gouging algorithmically blocked.", color: "text-red-400" },
  { icon: Users, title: "Neighborhood Circles", desc: "Hyper-local sharing groups. Your block, your rules, lower prices.", color: "text-amber-400" },
  { icon: Star, title: "Barter System", desc: "Trade items directly. No money required. Pure peer-to-peer exchange.", color: "text-purple-400" },
];

function AccessibilityPanel({ onClose }: { onClose: () => void }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const ACCESS_MODES = [
    { value: "default", label: "Default", desc: "Standard experience", icon: "🌐" },
    { value: "wcag_aaa", label: "WCAG AAA", desc: "Maximum accessibility", icon: "♿" },
    { value: "eco_code", label: "ECO CODE", desc: "Low energy, minimal animations", icon: "🌱" },
    { value: "neuro_code", label: "NEURO CODE", desc: "ADHD-friendly, reduced clutter", icon: "🧠" },
    { value: "dyslexic", label: "DYSLEXIC", desc: "OpenDyslexic font, wider spacing", icon: "📖" },
    { value: "no_blue_light", label: "NO BLUE LIGHT", desc: "Warm amber tones", icon: "🌙" },
  ];

  const [selected, setSelected] = useState(() => document.documentElement.getAttribute("data-access-mode") || "default");

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => utils.auth.me.invalidate(),
  });

  const applyMode = (mode: string) => {
    setSelected(mode);
    document.documentElement.setAttribute("data-access-mode", mode);
    if (isAuthenticated) {
      updateProfile.mutate({ accessibilityMode: mode as "default" | "wcag_aaa" | "eco_code" | "neuro_code" | "dyslexic" | "no_blue_light" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <Card className="relative z-10 p-6 bg-card border-border/50 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Accessibility Modes</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">x</button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Choose a display mode that works best for you. Changes apply instantly.</p>
        <div className="grid grid-cols-2 gap-2">
          {ACCESS_MODES.map(m => (
            <button key={m.value} onClick={() => applyMode(m.value)}
              className={`p-3 rounded-lg border text-left transition-all ${selected === m.value ? "border-primary bg-primary/10" : "border-border/30 bg-card/50 hover:border-primary/50"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{m.icon}</span>
                <span className="text-sm font-semibold">{m.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          {isAuthenticated ? "Your preference is saved to your profile." : "Sign in to save your preference."}
        </p>
      </Card>
    </div>
  );
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAccessibility, setShowAccessibility] = useState(false);

  const { data: featuredListings, isLoading: featuredLoading } = trpc.listings.search.useQuery({ limit: 6 });

  useEffect(() => {
    const savedMode = user?.accessibilityMode;
    if (savedMode && savedMode !== "default") {
      document.documentElement.setAttribute("data-access-mode", savedMode);
    }
  }, [user?.accessibilityMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/search");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/90">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl text-primary">Rentable</span>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs hidden sm:flex">Beta</Badge>
          </div>
          <div className="flex gap-2 items-center">
            <Link href="/search"><Button variant="ghost" size="sm" className="hidden sm:flex">Browse</Button></Link>
            <Link href="/emergency"><Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hidden sm:flex">Emergency</Button></Link>
            <button onClick={() => setShowAccessibility(true)} className="text-muted-foreground hover:text-foreground text-sm px-2 py-1 rounded hover:bg-card/50 transition-colors hidden sm:flex items-center gap-1">
              Accessibility
            </button>
            {isAuthenticated ? (
              <>
                <Link href="/list-item"><Button variant="default" size="sm">+ List Item</Button></Link>
                <Link href="/profile"><Button variant="outline" size="sm">{user?.name?.split(" ")[0] || "Profile"}</Button></Link>
              </>
            ) : (
              <a href={getLoginUrl()}><Button variant="default" size="sm">Sign In</Button></a>
            )}
          </div>
        </div>
      </nav>

      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-2" />
              The peer-to-peer rental marketplace for everything
            </Badge>
            <h1 className="font-display text-6xl md:text-8xl tracking-tight mb-6 leading-none">
              Rent the
              <br />
              <span className="text-primary">Unrentable.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Emotional support goats. Haunted mirrors. Astronaut suits. Industrial fog machines. Whatever you need, someone near you has it. Fair prices. CO2 tracked. Barter enabled.
            </p>
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search for anything... generators, goats, fog machines..."
                  className="pl-10 bg-card/80 border-border/50 h-12 text-base focus:border-primary/50"
                />
              </div>
              <Button type="submit" variant="default" size="lg" className="h-12 px-6">Search</Button>
            </form>
            <div className="flex flex-wrap gap-2">
              {["Generators", "Goats", "Tools", "Vehicles", "Weird Stuff"].map(tag => (
                <button key={tag} onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                  className="text-xs text-muted-foreground bg-card/50 border border-border/30 rounded-full px-3 py-1 hover:border-primary/50 hover:text-primary transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/30 bg-card/30 backdrop-blur-sm py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "12,847", label: "Active Listings", icon: Package },
              { value: "3,291", label: "Happy Renters", icon: Users },
              { value: "47.2t", label: "CO2 Saved", icon: Leaf },
              { value: "99.1%", label: "Satisfaction Rate", icon: Star },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <s.icon className="w-5 h-5 text-primary mb-1" />
                <span className="font-display text-3xl text-foreground">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-4xl">Browse Categories</h2>
            <Link href="/search"><Button variant="ghost" className="gap-1">All listings <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/search?category=${cat.slug}`}>
                <Card className="p-4 bg-card/80 border-border/30 hover:border-primary/50 hover:bg-card transition-all cursor-pointer group">
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-4xl">Featured Listings</h2>
              <p className="text-muted-foreground mt-1">Verified, fairly priced, ready to rent</p>
            </div>
            <Link href="/search"><Button variant="ghost" className="gap-1">View all <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
          {featuredLoading ? (
            <div className="flex justify-center py-12"><RefreshCw className="animate-spin text-primary w-8 h-8" /></div>
          ) : featuredListings && featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredListings.map((listing: { id: number; title: string; pricePerDay: string | number; images: unknown; category: string; isVerified?: boolean | null; isWeird?: boolean | null; isBarterEnabled?: boolean | null; location: string }) => (
                <Link key={listing.id} href={`/listing/${listing.id}`}>
                  <Card className="p-4 bg-card/80 border-border/30 hover:border-primary/50 transition-all cursor-pointer group overflow-hidden">
                    <div className="aspect-video bg-card/50 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-border/20">
                      {Array.isArray(listing.images) && listing.images.length > 0 ? (
                        <img src={listing.images[0] as string} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold group-hover:text-primary transition-colors leading-tight">{listing.title}</h3>
                      <span className="font-display text-lg text-primary whitespace-nowrap">${parseFloat(listing.pricePerDay as string).toFixed(0)}/day</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs capitalize">{listing.category}</Badge>
                      {listing.isVerified && <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Verified</Badge>}
                      {listing.isWeird && <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">Weird</Badge>}
                      {listing.isBarterEnabled && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Barter</Badge>}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{listing.location}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No listings yet. Be the first to list something!</p>
              <Link href="/list-item"><Button variant="default">List Your First Item</Button></Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-transparent to-primary/5" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">Weird Vault</Badge>
            <h2 className="font-display text-5xl mb-3">The Unexplainable</h2>
            <p className="text-muted-foreground text-lg">Items that defy categorization. Rent them anyway.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WEIRD_VAULT_ITEMS.map((item, i) => (
              <Card key={i} className="p-5 bg-card/80 border-purple-500/20 hover:border-purple-500/50 transition-all group cursor-pointer"
                onClick={() => navigate("/search?category=weird")}>
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{item.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold group-hover:text-purple-400 transition-colors">{item.title}</h3>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs whitespace-nowrap">{item.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.desc}</p>
                    <span className="font-display text-primary">{item.price}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/search?category=weird">
              <Button variant="outline" size="lg" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 gap-2">
                Enter the Vault <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-red-950/20 border-y border-red-500/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-red-400 font-semibold text-sm uppercase tracking-wider">Emergency Mode</span>
            </div>
            <h3 className="font-display text-3xl mb-2">Disaster Gear, Zero Price Gouging</h3>
            <p className="text-muted-foreground">When disasters strike, emergency listings surface instantly. Prices algorithmically locked to pre-emergency rates.</p>
          </div>
          <Link href="/emergency">
            <Button variant="outline" size="lg" className="border-red-500/50 text-red-400 hover:bg-red-500/10 whitespace-nowrap gap-2">
              Emergency Listings <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl mb-3">Not Your Grandma's Craigslist</h2>
            <p className="text-muted-foreground text-lg">We built the trust layer so you do not have to think about it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRUST_FEATURES.map((f, i) => (
              <Card key={i} className="p-5 bg-card/80 border-border/30 hover:border-primary/30 transition-all">
                <f.icon className={`w-8 h-8 ${f.color} mb-3`} />
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">AI-Powered</Badge>
              <h2 className="font-display text-4xl mb-4">Fair Value Engine</h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Our AI analyzes thousands of comparable rentals to suggest fair prices. Renters see a Fair Value Gauge on every listing.
              </p>
              <ul className="space-y-3">
                {[
                  "Real-time price analysis based on category, condition, and location",
                  "CO2 savings estimate per rental vs buying new",
                  "Confidence score so you know how reliable the estimate is",
                  "Automatically flags price gouging during emergencies",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/list-item" className="mt-6 inline-block">
                <Button variant="default" size="lg" className="gap-2">
                  List with AI Pricing <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              <Card className="p-4 bg-card/80 border-primary/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Portable Generator (Honda 2200W)</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Fair Price</Badge>
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <span className="font-display text-3xl text-primary">$45/day</span>
                  <span className="text-sm text-muted-foreground">AI suggests: $42 to $48</span>
                </div>
                <div className="h-2 bg-border/30 rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-green-500 rounded-full" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Below market</span><span>At market</span><span>Above</span></div>
              </Card>
              <Card className="p-4 bg-card/80 border-green-500/20">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-semibold text-green-400">CO2 Savings</p>
                    <p className="text-sm text-muted-foreground">Renting saves approx 12.4 kg CO2 vs buying new</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-card/80 border-border/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="font-semibold">Barter Enabled</p>
                    <p className="text-sm text-muted-foreground">Owner accepts trades. Offer your kayak for their generator.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-display text-5xl md:text-6xl mb-6">
            Start Renting.
            <br />
            <span className="text-primary">Start Earning.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Join thousands of people turning idle stuff into income and saving the planet one rental at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link href="/list-item"><Button variant="default" size="lg" className="gap-2">List Your First Item <ArrowRight className="w-4 h-4" /></Button></Link>
                <Link href="/search"><Button variant="outline" size="lg">Browse Listings</Button></Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}><Button variant="default" size="lg" className="gap-2">Get Started Free <ArrowRight className="w-4 h-4" /></Button></a>
                <Link href="/search"><Button variant="outline" size="lg">Browse First</Button></Link>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-6">Free forever. No credit card required. 100 tokens on signup.</p>
        </div>
      </section>

      <footer className="border-t border-border/30 bg-card/30 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="font-display text-xl text-primary block mb-3">Rentable</span>
              <p className="text-xs text-muted-foreground">The peer-to-peer rental marketplace for everything. Even goats.</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Marketplace</p>
              <div className="space-y-2">
                <Link href="/search"><p className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Browse Listings</p></Link>
                <Link href="/list-item"><p className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">List an Item</p></Link>
                <Link href="/emergency"><p className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Emergency Mode</p></Link>
                <Link href="/search?category=weird"><p className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Weird Vault</p></Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Account</p>
              <div className="space-y-2">
                <Link href="/profile"><p className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">My Profile</p></Link>
                <Link href="/pricing"><p className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Pricing</p></Link>
                <button onClick={() => setShowAccessibility(true)}><p className="text-xs text-muted-foreground hover:text-foreground transition-colors">Accessibility</p></button>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Help</p>
              <div className="space-y-2">
                <Link href="/support"><p className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Support Center</p></Link>
                <a href="https://github.com/MIDNGHTSAPPHIRE/rent-anything-hub" target="_blank" rel="noopener noreferrer"><p className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">GitHub (FOSS)</p></a>
              </div>
            </div>
          </div>
          <div className="border-t border-border/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">2025 Rentable. Open source. Built with FOSS.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowAccessibility(true)} className="text-xs text-muted-foreground hover:text-primary transition-colors">Accessibility</button>
              <span className="text-xs text-muted-foreground">Test card: 4242 4242 4242 4242</span>
            </div>
          </div>
        </div>
      </footer>

      {showAccessibility && <AccessibilityPanel onClose={() => setShowAccessibility(false)} />}
    </div>
  );
}
