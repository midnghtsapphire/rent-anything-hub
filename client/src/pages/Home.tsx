import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Shield, Zap, Users, DollarSign, MapPin, Search, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-display text-2xl font-bold text-primary">Rentable</div>
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <Link href="/search">
                  <Button variant="ghost">Browse</Button>
                </Link>
            <Link href="/list-item">
              <Button variant="default">List Item</Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline">{user?.name}</Button>
            </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="default">Sign In</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Sparkles className="w-3 h-3 mr-2" />
              Rent the Unrentable
            </Badge>
            <h1 className="font-display text-6xl md:text-7xl tracking-tight mb-6 leading-tight">
              Everything You Need,
              <br />
              <span className="text-gradient-primary">Nothing You Own</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              From emotional support goats to haunted mirrors to astronaut suits. Rent anything from your neighbors. Fair prices. CO₂ tracked. Barter enabled.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 mb-8">
              <Input
                placeholder="Search rentals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card border-border/50"
              />
              <Link href={`/search?q=${searchQuery}`}>
                <Button variant="default" size="lg" className="gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </Link>
            </div>

            <div className="flex gap-4">
              <Link href="/search">
                <Button variant="outline" size="lg">
                  Browse All
                </Button>
              </Link>
              <Link href="/emergency">
                <Button variant="outline" size="lg" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Emergency Mode
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <h2 className="font-display text-4xl mb-12">What Can You Rent?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Generators", icon: "⚡", color: "bg-warning/10" },
              { name: "Tools", icon: "🔧", color: "bg-accent/10" },
              { name: "Vehicles", icon: "🚗", color: "bg-primary/10" },
              { name: "Party Gear", icon: "🎉", color: "bg-success/10" },
              { name: "Safety Gear", icon: "🛡️", color: "bg-primary/10" },
              { name: "Home & Garden", icon: "🏠", color: "bg-accent/10" },
              { name: "Events", icon: "🎪", color: "bg-warning/10" },
              { name: "Weird Stuff", icon: "🛸", color: "bg-accent/10" },
            ].map((cat) => (
              <Link key={cat.name} href={`/search?category=${cat.name.toLowerCase()}`}>
                <Card className={`p-6 text-center cursor-pointer hover:border-primary/50 transition-all ${cat.color}`}>
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <p className="font-semibold">{cat.name}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 px-4 bg-card/30 border-t border-border/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-display text-4xl">Featured Rentals</h2>
            <Link href="/search">
              <Button variant="ghost" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Emotional Support Goat",
                price: 45,
                location: "Brooklyn, NY",
                rating: 4.9,
                reviews: 23,
                image: "🐐",
                weird: true,
              },
              {
                title: "Professional Ladder",
                price: 15,
                location: "Denver, CO",
                rating: 4.8,
                reviews: 156,
                image: "🪜",
              },
              {
                title: "Haunted Mirror",
                price: 25,
                location: "Salem, MA",
                rating: 4.7,
                reviews: 89,
                image: "👻",
                weird: true,
              },
            ].map((item, i) => (
              <Card key={i} className="overflow-hidden hover:border-primary/50 transition-all">
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-12 text-6xl flex items-center justify-center h-48">
                  {item.image}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display text-lg">{item.title}</h3>
                      {item.weird && <Badge className="mt-1 bg-accent/20 text-accent">🛸 Weird</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    {item.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-2xl text-primary">${item.price}</p>
                      <p className="text-xs text-muted-foreground">/day</p>
                    </div>
                    <Link href={`/listing/${i}`}>
                      <Button variant="default" size="sm">
                        Rent Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Weird Vault Section */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">The Weird Vault</Badge>
          <h2 className="font-display text-4xl mb-6">Rent the Unrentable</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
            From emotional support animals to haunted mirrors to astronaut suits. Our Weird Vault is where the internet's most bizarre rental items live. Browse the strange, the wonderful, the completely unexpected.
          </p>
          <Link href="/search?weird=true">
              <Button variant="default" size="lg" className="gap-2">
                Explore Weird Vault <Sparkles className="w-4 h-4" />
              </Button>
          </Link>
        </div>
      </section>

      {/* Trust/Features Section */}
      <section className="py-20 px-4 bg-card/30 border-t border-border/50">
        <div className="container mx-auto">
          <h2 className="font-display text-4xl mb-12">Why Rentable?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Safe Meetups Only",
                desc: "Police stations, libraries, banks. Public venue exchanges are the default.",
                color: "text-primary",
              },
              {
                icon: DollarSign,
                title: "Fair Value Engine",
                desc: "Our AI suggests fair prices so nobody overpays. Goodbye, $900 ladders.",
                color: "text-success",
              },
              {
                icon: Leaf,
                title: "CO₂ Tracking",
                desc: "See exactly how much carbon you save by renting instead of buying new.",
                color: "text-emerald-400",
              },
              {
                icon: Zap,
                title: "Emergency Mode",
                desc: "Storms, power outages, disasters — essential gear surfaces instantly.",
                color: "text-warning",
              },
              {
                icon: Users,
                title: "Barter System",
                desc: "Trade a truck for goat boarding. Swap staging furniture for labor.",
                color: "text-accent",
              },
              {
                icon: MapPin,
                title: "Local Galaxies",
                desc: "Every ZIP code is its own micro-economy. Browse what's rentable nearby.",
                color: "text-blue-400",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="p-6 border-border/50 hover:border-primary/50 transition-all">
                  <Icon className={`w-8 h-8 mb-4 ${feature.color}`} />
                  <h3 className="font-display text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 border-t border-border/50">
        <div className="container mx-auto text-center">
          <h2 className="font-display text-5xl mb-6">Ready to Rent?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of renters and owners building a sharing economy that actually works.
          </p>
          {isAuthenticated ? (
            <Link href="/list-item">
              <Button variant="default" size="lg" className="gap-2">
                List Your First Item <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
            <Button variant="default" size="lg" className="gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-display text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/search"><a>Browse</a></Link></li>
                <li><Link href="/emergency"><a>Emergency Mode</a></Link></li>
                <li><Link href="/search?weird=true"><a>Weird Vault</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Safety</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Rentable. Rent the Unrentable.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
