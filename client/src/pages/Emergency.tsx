import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap, Shield, MapPin } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Emergency() {
  const { data: listings = [] } = trpc.listings.search.useQuery({ isEmergency: true });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-warning/50 bg-warning/5 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-warning" />
            <h1 className="font-display text-4xl">Emergency Mode</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            When disaster strikes, essential gear surfaces instantly. No price gouging. Fair prices locked in. Verified sellers only.
          </p>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 border-warning/30 bg-warning/5">
            <Zap className="w-8 h-8 text-warning mb-3" />
            <h3 className="font-display text-lg mb-2">Instant Availability</h3>
            <p className="text-sm text-muted-foreground">
              Emergency listings are prioritized and surface immediately during declared disasters.
            </p>
          </Card>
          <Card className="p-6 border-warning/30 bg-warning/5">
            <Shield className="w-8 h-8 text-warning mb-3" />
            <h3 className="font-display text-lg mb-2">Fair Pricing</h3>
            <p className="text-sm text-muted-foreground">
              Our AI prevents price gouging. Emergency prices are capped at 1.5x normal rates.
            </p>
          </Card>
          <Card className="p-6 border-warning/30 bg-warning/5">
            <AlertTriangle className="w-8 h-8 text-warning mb-3" />
            <h3 className="font-display text-lg mb-2">Verified Sellers</h3>
            <p className="text-sm text-muted-foreground">
              All emergency listings require verified seller status and background checks.
            </p>
          </Card>
        </div>

        {/* Available Gear */}
        <div>
          <h2 className="font-display text-3xl mb-8">Available Emergency Gear</h2>
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No emergency listings at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing: any) => (
                <Card key={listing.id} className="overflow-hidden hover:border-warning/50 transition-all">
                  <div className="bg-gradient-to-br from-warning/20 to-accent/20 p-12 text-6xl flex items-center justify-center h-40">
                    ⚡
                  </div>
                  <div className="p-6">
                    <Badge className="mb-3 bg-warning/20 text-warning">Emergency</Badge>
                    <h3 className="font-display text-lg mb-2">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{listing.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4" />
                      {listing.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display text-2xl text-warning">${listing.pricePerDay}</p>
                        <p className="text-xs text-muted-foreground">/day</p>
                      </div>
                      <Link href={`/listing/${listing.id}`}>
                        <Button variant="default" size="sm">
                          Rent Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Emergency Categories */}
        <div className="mt-16 pt-12 border-t border-border/50">
          <h2 className="font-display text-3xl mb-8">Common Emergency Needs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Generators", emoji: "⚡" },
              { name: "Water Pumps", emoji: "💧" },
              { name: "First Aid", emoji: "🏥" },
              { name: "Tarps & Tarping", emoji: "🛡️" },
              { name: "Chainsaws", emoji: "🪚" },
              { name: "Dehumidifiers", emoji: "💨" },
              { name: "Flashlights", emoji: "🔦" },
              { name: "Batteries", emoji: "🔋" },
            ].map((cat) => (
              <Link key={cat.name} href={`/search?category=${cat.name.toLowerCase()}&emergency=true`}>
                <Card className="p-6 text-center cursor-pointer hover:border-warning/50 transition-all">
                  <div className="text-4xl mb-2">{cat.emoji}</div>
                  <p className="font-semibold text-sm">{cat.name}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
