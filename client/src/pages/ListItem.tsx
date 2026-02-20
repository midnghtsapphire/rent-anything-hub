import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Sparkles, Leaf, CheckCircle, RefreshCw } from "lucide-react";

function Nav() {
  const { user, isAuthenticated } = useAuth();
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/90">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/"><span className="font-display text-2xl text-primary cursor-pointer">Rentable</span></Link>
        <div className="flex gap-3 items-center">
          {isAuthenticated ? (
            <Link href="/profile"><Button variant="outline" size="sm">{user?.name?.split(" ")[0]}</Button></Link>
          ) : (
            <a href={getLoginUrl()}><Button variant="default" size="sm">Sign In</Button></a>
          )}
        </div>
      </div>
    </nav>
  );
}

const CATEGORIES = ["generators", "pumps", "tools", "safety", "vehicles", "home", "events", "weird", "other"] as const;
const CONDITIONS = ["like_new", "good", "fair", "poor"] as const;
const STEPS = ["Basic Info", "Details", "Pricing", "Review & Submit"];

export default function ListItem() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("tools");
  const [condition, setCondition] = useState<typeof CONDITIONS[number]>("good");
  const [location, setLocation] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [description, setDescription] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [isWeird, setIsWeird] = useState(false);
  const [isBarterEnabled, setIsBarterEnabled] = useState(false);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(false);
  const [specKey, setSpecKey] = useState("");
  const [specVal, setSpecVal] = useState("");
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [pricePerDay, setPricePerDay] = useState("");
  const [aiPrice, setAiPrice] = useState<{ suggestedPrice: number; confidence: string; reasoning: string; co2Estimate: number } | null>(null);

  const createListing = trpc.listings.create.useMutation({
    onSuccess: (data) => {
      toast.success("Listing created! 🎉");
      // data is MySqlRawQueryResult, navigate to search
      navigate("/search");
    },
    onError: (e) => toast.error(e.message),
  });

  const getFairPrice = trpc.ai.getFairPrice.useMutation({
    onSuccess: (data) => {
      setAiPrice(data);
      if (!pricePerDay) setPricePerDay(data.suggestedPrice.toFixed(2));
      toast.success("AI pricing complete!");
    },
    onError: (e) => toast.error(e.message),
  });

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="font-display text-4xl mb-4">Sign In to List Items</h2>
        <p className="text-muted-foreground mb-8">Join thousands of people renting out their stuff and earning extra income.</p>
        <a href={getLoginUrl()}><Button variant="default" size="lg">Sign In to Continue</Button></a>
      </div>
    </div>
  );

  const addSpec = () => {
    if (specKey && specVal) {
      setSpecs(s => ({ ...s, [specKey]: specVal }));
      setSpecKey(""); setSpecVal("");
    }
  };

  const removeSpec = (k: string) => setSpecs(s => { const n = { ...s }; delete n[k]; return n; });

  const handleSubmit = () => {
    if (!title || !location || !pricePerDay) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createListing.mutate({
      title, category, condition, location, zipCode,
      description, isEmergency, isWeird, isBarterEnabled, isDeliveryAvailable,
      specs, pricePerDay: parseFloat(pricePerDay),
      images: [],
    });
  };

  const canAdvance = () => {
    if (step === 0) return title.length >= 3 && location.length >= 2;
    if (step === 1) return true;
    if (step === 2) return parseFloat(pricePerDay) > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-8">
          <h1 className="font-display text-4xl text-foreground mb-2">List Your Item</h1>
          <p className="text-muted-foreground">Earn money from things you already own</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary/20 text-primary border-2 border-primary" : "bg-card text-muted-foreground border border-border/30"
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-8 transition-colors ${i < step ? "bg-primary" : "bg-border/30"}`} />}
            </div>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">{STEPS[step]}</span>
        </div>

        <Card className="p-6 bg-card/80 border-border/30">
          {/* STEP 0: Basic Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl text-foreground">Basic Information</h2>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Item Title *</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Emotional Support Goat, Portable Generator..." className="bg-background border-border/50" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Category *</label>
                <Select value={category} onValueChange={(v) => setCategory(v as typeof CATEGORIES[number])}>
                  <SelectTrigger className="bg-background border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border/50">
                    {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Condition *</label>
                <Select value={condition} onValueChange={(v) => setCondition(v as typeof CONDITIONS[number])}>
                  <SelectTrigger className="bg-background border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border/50">
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Location *</label>
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, State" className="bg-background border-border/50" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">ZIP Code</label>
                <Input value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="12345" className="bg-background border-border/50" maxLength={10} />
              </div>
            </div>
          )}

          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl text-foreground">Item Details</h2>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Description</label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Tell renters what makes this item special, any quirks, how to use it..." className="bg-background border-border/50" rows={4} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Specifications (optional)</label>
                <div className="flex gap-2 mb-2">
                  <Input value={specKey} onChange={e => setSpecKey(e.target.value)} placeholder="e.g. Weight" className="bg-background border-border/50" />
                  <Input value={specVal} onChange={e => setSpecVal(e.target.value)} placeholder="e.g. 5 kg" className="bg-background border-border/50" />
                  <Button variant="outline" onClick={addSpec} disabled={!specKey || !specVal}>Add</Button>
                </div>
                {Object.keys(specs).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(specs).map(([k, v]) => (
                      <Badge key={k} variant="outline" className="gap-1 cursor-pointer" onClick={() => removeSpec(k)}>
                        {k}: {v} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/20">
                  <div>
                    <p className="font-medium text-sm">🚨 Emergency Item</p>
                    <p className="text-xs text-muted-foreground">Available during disasters (price gouging blocked)</p>
                  </div>
                  <Switch checked={isEmergency} onCheckedChange={setIsEmergency} />
                </div>
                <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/20">
                  <div>
                    <p className="font-medium text-sm">🌀 Weird Vault</p>
                    <p className="text-xs text-muted-foreground">Feature in our viral discovery section</p>
                  </div>
                  <Switch checked={isWeird} onCheckedChange={setIsWeird} />
                </div>
                <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/20">
                  <div>
                    <p className="font-medium text-sm">⇄ Accept Barter Offers</p>
                    <p className="text-xs text-muted-foreground">Allow renters to trade items instead of paying</p>
                  </div>
                  <Switch checked={isBarterEnabled} onCheckedChange={setIsBarterEnabled} />
                </div>
                <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/20">
                  <div>
                    <p className="font-medium text-sm">🚚 Delivery Available</p>
                    <p className="text-xs text-muted-foreground">You can deliver to the renter</p>
                  </div>
                  <Switch checked={isDeliveryAvailable} onCheckedChange={setIsDeliveryAvailable} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Pricing */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl text-foreground">Set Your Price</h2>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Price Per Day ($) *</label>
                <Input type="number" value={pricePerDay} onChange={e => setPricePerDay(e.target.value)}
                  placeholder="0.00" min="0.50" step="0.50" className="bg-background border-border/50 text-2xl font-bold" />
              </div>

              <Button variant="outline" className="w-full gap-2 border-primary/50 text-primary hover:bg-primary/10"
                disabled={getFairPrice.isPending || !title}
                onClick={() => getFairPrice.mutate({ title, category, condition, location })}>
                {getFairPrice.isPending ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Get AI Fair Price Suggestion</>}
              </Button>

              {aiPrice && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-2xl text-primary">${aiPrice.suggestedPrice.toFixed(2)}/day</span>
                        <Badge variant="outline" className="text-xs capitalize">{aiPrice.confidence} confidence</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{aiPrice.reasoning}</p>
                      {aiPrice.co2Estimate > 0 && (
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <Leaf className="w-4 h-4" />
                          <span>~{aiPrice.co2Estimate} kg CO₂ saved per rental</span>
                        </div>
                      )}
                      <Button variant="default" size="sm" onClick={() => setPricePerDay(aiPrice.suggestedPrice.toFixed(2))}>
                        Use This Price
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl text-foreground">Review & Submit</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card/50 rounded-lg p-3 border border-border/20">
                    <p className="text-xs text-muted-foreground">Title</p>
                    <p className="font-medium text-sm">{title}</p>
                  </div>
                  <div className="bg-card/50 rounded-lg p-3 border border-border/20">
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-medium text-sm capitalize">{category}</p>
                  </div>
                  <div className="bg-card/50 rounded-lg p-3 border border-border/20">
                    <p className="text-xs text-muted-foreground">Condition</p>
                    <p className="font-medium text-sm capitalize">{condition.replace("_", " ")}</p>
                  </div>
                  <div className="bg-card/50 rounded-lg p-3 border border-border/20">
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-display text-lg text-primary">${parseFloat(pricePerDay).toFixed(2)}/day</p>
                  </div>
                  <div className="bg-card/50 rounded-lg p-3 border border-border/20 col-span-2">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-sm">{location}{zipCode ? ` ${zipCode}` : ""}</p>
                  </div>
                </div>

                {description && (
                  <div className="bg-card/50 rounded-lg p-3 border border-border/20">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground/80">{description}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {isEmergency && <Badge className="bg-red-500/20 text-red-400 border-red-500/30">🚨 Emergency</Badge>}
                  {isWeird && <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">🌀 Weird Vault</Badge>}
                  {isBarterEnabled && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">⇄ Barter OK</Badge>}
                  {isDeliveryAvailable && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">🚚 Delivery</Badge>}
                </div>
              </div>

              <Button variant="default" size="lg" className="w-full" disabled={createListing.isPending} onClick={handleSubmit}>
                {createListing.isPending ? <><RefreshCw className="w-4 h-4 animate-spin mr-2" /> Creating...</> : "🚀 Publish Listing"}
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-border/20">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            {step < 3 && (
              <Button variant="default" onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
