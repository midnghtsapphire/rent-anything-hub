import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Star, Leaf, Shield, Zap, ArrowLeft, Flag, RefreshCw, ChevronLeft, ChevronRight, Calendar, Package, User } from "lucide-react";

function Nav() {
  const { user, isAuthenticated } = useAuth();
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/90">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/"><span className="font-display text-2xl text-primary cursor-pointer">Rentable</span></Link>
        <div className="flex gap-3 items-center">
          <Link href="/search"><Button variant="ghost" size="sm">Browse</Button></Link>
          {isAuthenticated ? (
            <>
              <Link href="/list-item"><Button variant="default" size="sm">+ List Item</Button></Link>
              <Link href="/profile"><Button variant="outline" size="sm">{user?.name?.split(" ")[0]}</Button></Link>
            </>
          ) : (
            <a href={getLoginUrl()}><Button variant="default" size="sm">Sign In</Button></a>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [imgIdx, setImgIdx] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [rentOpen, setRentOpen] = useState(false);
  const [barterOpen, setBarterOpen] = useState(false);
  const [barterDesc, setBarterDesc] = useState("");
  const [barterMsg, setBarterMsg] = useState("");

  const { data: listing, isLoading } = trpc.listings.getById.useQuery({ id }, { enabled: id > 0 });
  const { data: reviews } = trpc.listings.getReviews.useQuery({ listingId: id }, { enabled: id > 0 });

  const createRental = trpc.rentals.create.useMutation({
    onSuccess: () => { toast.success("Rental request sent!"); setRentOpen(false); utils.listings.getById.invalidate({ id }); },
    onError: (e) => toast.error(e.message),
  });

  const createBarter = trpc.barter.createOffer.useMutation({
    onSuccess: () => { toast.success("Barter offer sent!"); setBarterOpen(false); },
    onError: (e) => toast.error(e.message),
  });

  const flagListing = trpc.listings.flag.useMutation({
    onSuccess: () => toast.success("Listing flagged for review."),
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background text-foreground"><Nav />
      <div className="flex items-center justify-center py-24"><RefreshCw className="animate-spin text-primary w-8 h-8" /></div>
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen bg-background text-foreground"><Nav />
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="font-display text-4xl mb-4">Listing Not Found</h2>
        <Link href="/search"><Button variant="default">Browse Listings</Button></Link>
      </div>
    </div>
  );

  const images: string[] = Array.isArray(listing.images) ? listing.images : [];
  const specs: Record<string, string> = (listing.specs && typeof listing.specs === "object") ? listing.specs as Record<string, string> : {};
  const price = parseFloat(listing.pricePerDay as string);
  const fairPrice = listing.fairValuePrice ? parseFloat(listing.fairValuePrice as string) : null;
  const co2 = listing.co2SavedPerRental ? parseFloat(listing.co2SavedPerRental as string) : 0;
  const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)) : 1;
  const total = (price * days).toFixed(2);

  const conditionColors: Record<string, string> = {
    like_new: "bg-green-500/20 text-green-400 border-green-500/30",
    good: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    fair: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    poor: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate("/search")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to search
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div>
            <div className="relative rounded-xl overflow-hidden bg-card border border-border/50 aspect-video">
              {images.length > 0 ? (
                <img src={images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-card"><Package className="w-16 h-16 text-muted-foreground" /></div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2"><ChevronRight className="w-4 h-4" /></button>
                </>
              )}
              <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                {listing.isEmergency && <Badge className="bg-red-500/90 text-white border-0">🚨 Emergency</Badge>}
                {listing.isWeird && <Badge className="bg-purple-500/90 text-white border-0">🌀 Weird Vault</Badge>}
                {listing.isVerified && <Badge className="bg-green-500/90 text-white border-0">✓ Verified</Badge>}
                {listing.isBarterEnabled && <Badge className="bg-amber-500/90 text-white border-0">⇄ Barter OK</Badge>}
              </div>
            </div>

            {co2 > 0 && (
              <Card className="mt-4 p-4 bg-green-950/40 border-green-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center"><Leaf className="w-5 h-5 text-green-400" /></div>
                  <div>
                    <p className="font-semibold text-green-400">CO₂ Savings</p>
                    <p className="text-sm text-muted-foreground">Renting saves ~<strong className="text-green-300">{co2} kg CO₂</strong> vs buying new</p>
                  </div>
                </div>
              </Card>
            )}

            <div className="mt-6">
              <h3 className="font-display text-xl mb-3">Reviews {avgRating && <span className="text-primary ml-2">★ {avgRating}</span>}</h3>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <Card key={r.id} className="p-4 bg-card/80 border-border/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />)}</div>
                        <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p className="text-sm text-foreground/80">{r.comment}</p>}
                    </Card>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm">No reviews yet. Be the first to rent!</p>}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="capitalize">{listing.category}</Badge>
                <Badge className={conditionColors[listing.condition] || ""}>{listing.condition.replace("_", " ")}</Badge>
                <Badge variant="outline" className={listing.availability === "available" ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}>{listing.availability}</Badge>
              </div>
              <h1 className="font-display text-4xl leading-tight">{listing.title}</h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{listing.location}{listing.zipCode ? ` · ${listing.zipCode}` : ""}</span>
              </div>
            </div>

            <Card className="p-4 bg-card/80 border-border/30">
              <div className="flex items-end gap-3">
                <div>
                  <span className="font-display text-4xl text-primary">${price.toFixed(2)}</span>
                  <span className="text-muted-foreground text-sm ml-1">/ day</span>
                </div>
                {fairPrice && (
                  <div className="text-sm text-muted-foreground">
                    <span className="text-xs">AI Fair Value: </span>
                    <span className={price <= fairPrice * 1.1 ? "text-green-400" : "text-amber-400"}>${fairPrice.toFixed(2)}</span>
                    <span className="ml-1 text-xs">{price <= fairPrice * 1.1 ? "✓ Fair" : "⚠ Above avg"}</span>
                  </div>
                )}
              </div>
              {fairPrice && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Below market</span><span>At market</span><span>Above market</span></div>
                  <div className="h-2 bg-border/30 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${price <= fairPrice * 0.9 ? "bg-green-500" : price <= fairPrice * 1.1 ? "bg-primary" : "bg-amber-500"}`}
                      style={{ width: `${Math.min(100, Math.max(10, (price / (fairPrice * 1.5)) * 100))}%` }} />
                  </div>
                </div>
              )}
            </Card>

            {listing.description && (
              <div>
                <h3 className="font-semibold mb-2">About this item</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{listing.description}</p>
              </div>
            )}

            {Object.keys(specs).length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(specs).map(([k, v]) => (
                    <div key={k} className="bg-card/50 rounded-lg p-2 border border-border/20">
                      <p className="text-xs text-muted-foreground capitalize">{k}</p>
                      <p className="text-sm font-medium">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {listing.isDeliveryAvailable && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-card/50 rounded-full px-3 py-1 border border-border/20"><Zap className="w-3 h-3 text-primary" /> Delivery available</div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-card/50 rounded-full px-3 py-1 border border-border/20"><Shield className="w-3 h-3 text-green-400" /> Safe meetup locations</div>
            </div>

            <Separator className="border-border/30" />

            <Card className="p-4 bg-card/80 border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="font-semibold">Owner</p>
                  <p className="text-xs text-muted-foreground">Member since {new Date(listing.createdAt).getFullYear()} · {listing.viewCount} views</p>
                </div>
              </div>
            </Card>

            {listing.availability === "available" ? (
              <div className="space-y-3">
                {isAuthenticated ? (
                  <>
                    <Dialog open={rentOpen} onOpenChange={setRentOpen}>
                      <DialogTrigger asChild>
                        <Button variant="default" size="lg" className="w-full gap-2"><Calendar className="w-4 h-4" /> Request to Rent</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border/50">
                        <DialogHeader><DialogTitle className="font-display text-2xl">Request Rental</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm text-muted-foreground mb-1 block">Start Date</label>
                              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="bg-background border-border/50" />
                            </div>
                            <div>
                              <label className="text-sm text-muted-foreground mb-1 block">End Date</label>
                              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split("T")[0]} className="bg-background border-border/50" />
                            </div>
                          </div>
                          {startDate && endDate && (
                            <Card className="p-3 bg-primary/10 border-primary/30">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{days} day{days > 1 ? "s" : ""} × ${price.toFixed(2)}</span>
                                <span className="font-bold text-primary">${total}</span>
                              </div>
                            </Card>
                          )}
                          <div>
                            <label className="text-sm text-muted-foreground mb-1 block">Notes (optional)</label>
                            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requests..." className="bg-background border-border/50" rows={3} />
                          </div>
                          <Button variant="default" className="w-full" disabled={!startDate || !endDate || createRental.isPending}
                            onClick={() => createRental.mutate({ listingId: id, startDate, endDate, notes })}>
                            {createRental.isPending ? "Sending..." : `Send Request · $${total}`}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {listing.isBarterEnabled && (
                      <Dialog open={barterOpen} onOpenChange={setBarterOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="lg" className="w-full gap-2">⇄ Make Barter Offer</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border/50">
                          <DialogHeader><DialogTitle className="font-display text-2xl">Barter Offer</DialogTitle></DialogHeader>
                          <div className="space-y-4 pt-2">
                            <div>
                              <label className="text-sm text-muted-foreground mb-1 block">What are you offering?</label>
                              <Textarea value={barterDesc} onChange={e => setBarterDesc(e.target.value)} placeholder="Describe what you'd like to trade..." className="bg-background border-border/50" rows={3} />
                            </div>
                            <div>
                              <label className="text-sm text-muted-foreground mb-1 block">Message (optional)</label>
                              <Textarea value={barterMsg} onChange={e => setBarterMsg(e.target.value)} placeholder="Any additional details..." className="bg-background border-border/50" rows={2} />
                            </div>
                            <Button variant="default" className="w-full" disabled={barterDesc.length < 10 || createBarter.isPending}
                              onClick={() => createBarter.mutate({ listingId: id, toUserId: listing.userId, offeredItemDescription: barterDesc, message: barterMsg })}>
                              {createBarter.isPending ? "Sending..." : "Send Barter Offer"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </>
                ) : (
                  <a href={getLoginUrl()}><Button variant="default" size="lg" className="w-full">Sign In to Rent</Button></a>
                )}
                <button onClick={() => flagListing.mutate({ id, reason: "User reported" })}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-red-400 transition-colors mx-auto">
                  <Flag className="w-3 h-3" /> Report this listing
                </button>
              </div>
            ) : (
              <Card className="p-4 bg-red-950/30 border-red-500/30 text-center">
                <p className="text-red-400 font-semibold">Currently Unavailable</p>
                <Link href="/search"><Button variant="outline" size="sm" className="mt-3">Browse Similar</Button></Link>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
