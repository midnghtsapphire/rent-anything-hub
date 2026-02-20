import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Filter, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Search() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  
  const [filters, setFilters] = useState({
    category: params.get("category") || "",
    zipCode: "",
    isEmergency: params.get("emergency") === "true",
    isWeird: params.get("weird") === "true",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: listings = [], isLoading } = trpc.listings.search.useQuery(filters);

  const categories = [
    "Generators",
    "Tools",
    "Vehicles",
    "Party Gear",
    "Safety Gear",
    "Home & Garden",
    "Events",
    "Weird Stuff",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 py-6 px-4">
        <div className="container mx-auto">
          <h1 className="font-display text-4xl mb-4">Browse Rentals</h1>
          <div className="flex gap-2">
            <Input placeholder="Search..." className="flex-1" />
            <Button variant="outline" size="lg" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          {(showFilters || typeof window !== "undefined" && window.innerWidth >= 1024) && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-lg mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.category === cat.toLowerCase()}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            category: e.target.checked ? cat.toLowerCase() : "",
                          })
                        }
                        className="rounded"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg mb-3">Location</h3>
                <Input
                  placeholder="ZIP Code"
                  value={filters.zipCode}
                  onChange={(e) => setFilters({ ...filters, zipCode: e.target.value })}
                />
              </div>

              <div>
                <h3 className="font-display text-lg mb-3">Special</h3>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={filters.isEmergency}
                    onChange={(e) => setFilters({ ...filters, isEmergency: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Emergency Mode</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isWeird}
                    onChange={(e) => setFilters({ ...filters, isWeird: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Weird Vault Only</span>
                </label>
              </div>

              {(filters.category || filters.zipCode || filters.isEmergency || filters.isWeird) && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      category: "",
                      zipCode: "",
                      isEmergency: false,
                      isWeird: false,
                    })
                  }
                  className="w-full gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No rentals found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listings.map((listing: any) => (
                  <Card key={listing.id} className="overflow-hidden hover:border-primary/50 transition-all">
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-12 text-6xl flex items-center justify-center h-40">
                      {listing.isWeird ? "🛸" : "📦"}
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-display text-lg">{listing.title}</h3>
                          {listing.isEmergency && <Badge className="mt-1 bg-warning/20 text-warning">⚡ Emergency</Badge>}
                          {listing.isWeird && <Badge className="mt-1 bg-accent/20 text-accent">🛸 Weird</Badge>}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{listing.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4" />
                        {listing.location}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display text-2xl text-primary">${listing.pricePerDay}</p>
                          <p className="text-xs text-muted-foreground">/day</p>
                        </div>
                        <Button variant="default" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
