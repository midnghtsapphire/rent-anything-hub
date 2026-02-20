import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Package, Calendar, Coins, Settings, RefreshCw, Leaf, Star, ArrowRight } from "lucide-react";

function Nav() {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/90">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/"><span className="font-display text-2xl text-primary cursor-pointer">Rentable</span></Link>
        <div className="flex gap-3 items-center">
          <Link href="/search"><Button variant="ghost" size="sm">Browse</Button></Link>
          <Link href="/list-item"><Button variant="default" size="sm">+ List Item</Button></Link>
          {isAuthenticated && <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>}
        </div>
      </div>
    </nav>
  );
}

const ACCESS_MODES = [
  { value: "default", label: "Default", desc: "Standard experience" },
  { value: "wcag_aaa", label: "WCAG AAA", desc: "Maximum accessibility, high contrast" },
  { value: "eco_code", label: "ECO CODE", desc: "Low energy, minimal animations" },
  { value: "neuro_code", label: "NEURO CODE", desc: "ADHD-friendly, reduced clutter" },
  { value: "dyslexic", label: "DYSLEXIC", desc: "OpenDyslexic font, wider spacing" },
  { value: "no_blue_light", label: "NO BLUE LIGHT", desc: "Warm amber tones, eye strain reduction" },
] as const;

type AccessMode = typeof ACCESS_MODES[number]["value"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  canceled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [locationVal, setLocationVal] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [accessMode, setAccessMode] = useState<AccessMode>("default");

  const { data: myListings, isLoading: listingsLoading } = trpc.listings.myListings.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myRentals, isLoading: rentalsLoading } = trpc.rentals.myRentals.useQuery(undefined, { enabled: isAuthenticated });
  const { data: ownerRentals } = trpc.rentals.myOwnerRentals.useQuery(undefined, { enabled: isAuthenticated });
  const { data: tokenBalance } = trpc.tokens.getBalance.useQuery(undefined, { enabled: isAuthenticated });
  const { data: tokenHistory } = trpc.tokens.getHistory.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myBarterOffers } = trpc.barter.myOffers.useQuery(undefined, { enabled: isAuthenticated });

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!");
      setEditMode(false);
      utils.auth.me.invalidate();
      // Apply accessibility mode
      document.documentElement.setAttribute("data-access-mode", accessMode);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteListing = trpc.listings.delete.useMutation({
    onSuccess: () => { toast.success("Listing deleted."); utils.listings.myListings.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const createCheckout = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) { window.open(data.url, "_blank"); toast.info("Redirecting to payment..."); }
    },
    onError: (e) => toast.error(e.message),
  });

  if (loading) return (
    <div className="min-h-screen bg-background text-foreground"><Nav />
      <div className="flex items-center justify-center py-24"><RefreshCw className="animate-spin text-primary w-8 h-8" /></div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background text-foreground"><Nav />
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="font-display text-4xl mb-4">Sign In to View Profile</h2>
        <a href={getLoginUrl()}><Button variant="default" size="lg">Sign In</Button></a>
      </div>
    </div>
  );

  const initials = (user?.displayName || user?.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const startEdit = () => {
    setDisplayName(user?.displayName || user?.name || "");
    setBio(user?.bio || "");
    setLocationVal(user?.location || "");
    setZipCode(user?.zipCode || "");
    setPhone(user?.phone || "");
    setAccessMode((user?.accessibilityMode as AccessMode) || "default");
    setEditMode(true);
  };

  const tierColors: Record<string, string> = {
    free: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    starter: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    pro: "bg-primary/20 text-primary border-primary/30",
    enterprise: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="p-6 bg-card/80 border-border/30 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={initials} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="font-display text-2xl text-primary">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl">{user?.displayName || user?.name || "Anonymous"}</h1>
                <Badge className={tierColors[user?.subscriptionTier || "free"] || ""}>{user?.subscriptionTier || "free"}</Badge>
                {user?.role === "admin" && <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Admin</Badge>}
              </div>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              {user?.bio && <p className="text-sm mt-1">{user.bio}</p>}
              {user?.location && <p className="text-xs text-muted-foreground mt-1">📍 {user.location}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={startEdit}><Settings className="w-4 h-4 mr-1" /> Edit</Button>
              {user?.role === "admin" && <Link href="/admin"><Button variant="default" size="sm">Admin Panel</Button></Link>}
            </div>
          </div>
          {/* Token Balance */}
          <div className="mt-4 flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-amber-400">{tokenBalance ?? user?.tokenBalance ?? 0} Tokens</span>
            <span className="text-xs text-muted-foreground">· Earn by renting, spend on premium features</span>
            <Link href="/pricing" className="ml-auto"><Button variant="ghost" size="sm" className="text-primary text-xs">Get More <ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
          </div>
        </Card>

        {/* Edit Modal */}
        {editMode && (
          <Card className="p-6 bg-card/80 border-primary/30 mb-6">
            <h2 className="font-display text-xl mb-4">Edit Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Display Name</label>
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-background border-border/50" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Phone</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-background border-border/50" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Location</label>
                <Input value={locationVal} onChange={e => setLocationVal(e.target.value)} className="bg-background border-border/50" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">ZIP Code</label>
                <Input value={zipCode} onChange={e => setZipCode(e.target.value)} className="bg-background border-border/50" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground mb-1 block">Bio</label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} className="bg-background border-border/50" rows={3} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground mb-2 block">Accessibility Mode</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ACCESS_MODES.map(m => (
                    <button key={m.value} onClick={() => setAccessMode(m.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${accessMode === m.value ? "border-primary bg-primary/10" : "border-border/30 bg-card/50 hover:border-primary/50"}`}>
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="default" disabled={updateProfile.isPending}
                onClick={() => updateProfile.mutate({ displayName, bio, location: locationVal, zipCode, phone, accessibilityMode: accessMode })}>
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="listings">
          <TabsList className="bg-card/50 border border-border/30 mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="listings" className="gap-1"><Package className="w-4 h-4" /> My Listings</TabsTrigger>
            <TabsTrigger value="rentals" className="gap-1"><Calendar className="w-4 h-4" /> My Rentals</TabsTrigger>
            <TabsTrigger value="owner" className="gap-1"><User className="w-4 h-4" /> Owner View</TabsTrigger>
            <TabsTrigger value="barter" className="gap-1">⇄ Barter</TabsTrigger>
            <TabsTrigger value="tokens" className="gap-1"><Coins className="w-4 h-4" /> Tokens</TabsTrigger>
          </TabsList>

          {/* MY LISTINGS */}
          <TabsContent value="listings">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl">My Listings</h2>
              <Link href="/list-item"><Button variant="default" size="sm">+ New Listing</Button></Link>
            </div>
            {listingsLoading ? (
              <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-primary w-6 h-6" /></div>
            ) : myListings && myListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myListings.map(l => (
                  <Card key={l.id} className="p-4 bg-card/80 border-border/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link href={`/listing/${l.id}`}><h3 className="font-semibold hover:text-primary transition-colors truncate">{l.title}</h3></Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">{l.category}</Badge>
                          <Badge variant="outline" className={l.availability === "available" ? "text-green-400 border-green-500/30 text-xs" : "text-red-400 border-red-500/30 text-xs"}>{l.availability}</Badge>
                        </div>
                        <p className="text-primary font-display text-lg mt-1">${parseFloat(l.pricePerDay as string).toFixed(2)}/day</p>
                        <p className="text-xs text-muted-foreground">{l.viewCount} views</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Link href={`/listing/${l.id}`}><Button variant="outline" size="sm">View</Button></Link>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300"
                          onClick={() => { if (confirm("Delete this listing?")) deleteListing.mutate({ id: l.id }); }}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center bg-card/50 border-border/20">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No listings yet. Start earning by listing something!</p>
                <Link href="/list-item"><Button variant="default">List Your First Item</Button></Link>
              </Card>
            )}
          </TabsContent>

          {/* MY RENTALS */}
          <TabsContent value="rentals">
            <h2 className="font-display text-xl mb-4">My Rentals</h2>
            {rentalsLoading ? (
              <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-primary w-6 h-6" /></div>
            ) : myRentals && myRentals.length > 0 ? (
              <div className="space-y-3">
                {myRentals.map(r => (
                  <Card key={r.id} className="p-4 bg-card/80 border-border/30">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={STATUS_COLORS[r.status] || ""}>{r.status.replace("_", " ")}</Badge>
                          <Badge variant="outline" className={r.paymentStatus === "paid" ? "text-green-400 border-green-500/30 text-xs" : "text-yellow-400 border-yellow-500/30 text-xs"}>{r.paymentStatus}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Listing #{r.listingId}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()}
                        </p>
                        <p className="font-display text-lg text-primary mt-1">${parseFloat(r.totalPrice as string).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Link href={`/listing/${r.listingId}`}><Button variant="outline" size="sm">View Item</Button></Link>
                        {r.paymentStatus === "pending" && r.status === "confirmed" && (
                          <Button variant="default" size="sm" disabled={createCheckout.isPending}
                            onClick={() => createCheckout.mutate({ rentalId: r.id, origin: window.location.origin })}>
                            {createCheckout.isPending ? "..." : "Pay Now"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center bg-card/50 border-border/20">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No rentals yet. Browse and rent something!</p>
                <Link href="/search"><Button variant="default">Browse Listings</Button></Link>
              </Card>
            )}
          </TabsContent>

          {/* OWNER RENTALS */}
          <TabsContent value="owner">
            <h2 className="font-display text-xl mb-4">Rental Requests for My Items</h2>
            {ownerRentals && ownerRentals.length > 0 ? (
              <div className="space-y-3">
                {ownerRentals.map((r: typeof ownerRentals[0]) => (
                  <Card key={r.id} className="p-4 bg-card/80 border-border/30">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={STATUS_COLORS[r.status] || ""}>{r.status.replace("_", " ")}</Badge>
                        </div>
                        <p className="text-sm">Renter #{r.renterId} · Listing #{r.listingId}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()}
                        </p>
                        <p className="font-display text-lg text-primary mt-1">${parseFloat(r.totalPrice as string).toFixed(2)}</p>
                        {r.notes && <p className="text-xs text-muted-foreground mt-1">"{r.notes}"</p>}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Link href={`/listing/${r.listingId}`}><Button variant="outline" size="sm">View Item</Button></Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center bg-card/50 border-border/20">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No rental requests yet.</p>
              </Card>
            )}
          </TabsContent>

          {/* BARTER */}
          <TabsContent value="barter">
            <h2 className="font-display text-xl mb-4">My Barter Offers</h2>
            {myBarterOffers && myBarterOffers.length > 0 ? (
              <div className="space-y-3">
                {myBarterOffers.map(b => (
                  <Card key={b.id} className="p-4 bg-card/80 border-border/30">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="mb-2 capitalize">{b.status}</Badge>
                        <p className="text-sm font-medium">Listing #{b.listingId}</p>
                        <p className="text-sm text-muted-foreground mt-1">{b.offeredItemDescription}</p>
                        {b.message && <p className="text-xs text-muted-foreground mt-1 italic">"{b.message}"</p>}
                        <p className="text-xs text-muted-foreground mt-1">{new Date(b.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Link href={`/listing/${b.listingId}`}><Button variant="outline" size="sm">View Item</Button></Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center bg-card/50 border-border/20">
                <p className="text-muted-foreground">No barter offers yet. Find a listing with barter enabled!</p>
                <Link href="/search"><Button variant="default" className="mt-4">Browse Listings</Button></Link>
              </Card>
            )}
          </TabsContent>

          {/* TOKENS */}
          <TabsContent value="tokens">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl">Token Economy</h2>
              <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="font-display text-xl text-amber-400">{tokenBalance ?? user?.tokenBalance ?? 0}</span>
                <span className="text-xs text-muted-foreground">tokens</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-green-950/30 border-green-500/20 text-center">
                <Leaf className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="font-semibold text-green-400">Earn Tokens</p>
                <p className="text-xs text-muted-foreground mt-1">Complete rentals, leave reviews, refer friends</p>
              </Card>
              <Card className="p-4 bg-primary/10 border-primary/20 text-center">
                <Star className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-semibold text-primary">Spend Tokens</p>
                <p className="text-xs text-muted-foreground mt-1">Feature listings, unlock premium filters, boost visibility</p>
              </Card>
              <Card className="p-4 bg-purple-950/30 border-purple-500/20 text-center">
                <Coins className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="font-semibold text-purple-400">Buy Tokens</p>
                <p className="text-xs text-muted-foreground mt-1">Purchase token packs from the pricing page</p>
              </Card>
            </div>

            <h3 className="font-semibold mb-3">Transaction History</h3>
            {tokenHistory && tokenHistory.length > 0 ? (
              <div className="space-y-2">
                {tokenHistory.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/20">
                    <div>
                      <p className="text-sm font-medium capitalize">{t.type}</p>
                      <p className="text-xs text-muted-foreground">{t.description || "Token transaction"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-display text-lg ${t.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                      {t.amount > 0 ? "+" : ""}{t.amount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center bg-card/50 border-border/20">
                <p className="text-muted-foreground">No transactions yet. Start renting to earn tokens!</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
