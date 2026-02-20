import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, Zap, Star, Building2, ArrowLeft } from "lucide-react";

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

const PLANS = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    icon: Star,
    color: "text-gray-400",
    borderColor: "border-border/30",
    bgColor: "bg-card/80",
    features: [
      "3 active listings",
      "Basic search filters",
      "100 tokens on signup",
      "Standard listing placement",
      "Community support",
    ],
    cta: "Get Started",
    tier: "free" as const,
  },
  {
    name: "Starter",
    price: 9.99,
    period: "month",
    icon: Zap,
    color: "text-primary",
    borderColor: "border-primary/50",
    bgColor: "bg-card/80",
    badge: "Most Popular",
    features: [
      "15 active listings",
      "Advanced search filters",
      "500 tokens/month",
      "Priority listing placement",
      "Barter system access",
      "Email support",
      "Analytics dashboard",
    ],
    cta: "Start Starter",
    tier: "starter" as const,
  },
  {
    name: "Pro",
    price: 29.99,
    period: "month",
    icon: Star,
    color: "text-amber-400",
    borderColor: "border-amber-500/50",
    bgColor: "bg-amber-950/20",
    features: [
      "Unlimited listings",
      "All filters + AI recommendations",
      "2000 tokens/month",
      "Featured listing slots",
      "Neighborhood Circle creation",
      "Priority support",
      "Advanced analytics",
      "Custom listing URL",
      "Damage protection add-on",
    ],
    cta: "Go Pro",
    tier: "pro" as const,
  },
  {
    name: "Enterprise",
    price: 99.99,
    period: "month",
    icon: Building2,
    color: "text-purple-400",
    borderColor: "border-purple-500/50",
    bgColor: "bg-purple-950/20",
    features: [
      "Everything in Pro",
      "Unlimited tokens",
      "White-label options",
      "API access",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom integrations",
      "Team accounts (up to 10)",
    ],
    cta: "Contact Sales",
    tier: "enterprise" as const,
  },
];

const TOKEN_PACKS = [
  { tokens: 100, price: 0.99, label: "Starter Pack", color: "text-gray-400" },
  { tokens: 500, price: 3.99, label: "Power Pack", color: "text-primary", popular: true },
  { tokens: 2000, price: 12.99, label: "Pro Pack", color: "text-amber-400" },
  { tokens: 10000, price: 49.99, label: "Enterprise Pack", color: "text-purple-400" },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();

  const createSubscription = trpc.stripe.createSubscription.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.info("Redirecting to secure checkout...");
      }
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleSubscribe = (tier: "starter" | "pro" | "enterprise") => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (tier === "enterprise") {
      toast.info("Contact us at hello@rentable.app for enterprise pricing.");
      return;
    }
    createSubscription.mutate({ tier, origin: window.location.origin });
  };

  const handleTokenPurchase = (_tokens: number) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    toast.info("Token packs coming soon! Subscribe to a plan to get monthly tokens.");
  };

  const isPending = createSubscription.isPending;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="font-display text-5xl text-foreground mb-4">Simple, Honest Pricing</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">No hidden fees. No surprise charges. Cancel anytime. Test with card <code className="bg-card/50 px-2 py-0.5 rounded text-primary">4242 4242 4242 4242</code>.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={`p-6 ${plan.bgColor} border ${plan.borderColor} relative flex flex-col`}>
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-0 whitespace-nowrap">{plan.badge}</Badge>
              )}
              <div className="flex items-center gap-2 mb-4">
                <plan.icon className={`w-6 h-6 ${plan.color}`} />
                <h3 className="font-display text-xl">{plan.name}</h3>
              </div>
              <div className="mb-6">
                {plan.price === 0 ? (
                  <span className="font-display text-4xl">Free</span>
                ) : (
                  <>
                    <span className="font-display text-4xl text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                  </>
                )}
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className={`w-4 h-4 ${plan.color} flex-shrink-0 mt-0.5`} />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
              {plan.tier === "free" ? (
                isAuthenticated ? (
                  <Link href="/profile"><Button variant="outline" className="w-full">View Profile</Button></Link>
                ) : (
                  <a href={getLoginUrl()}><Button variant="outline" className="w-full">{plan.cta}</Button></a>
                )
              ) : (
                <Button
                  variant={plan.tier === "starter" ? "default" : "outline"}
                  className={`w-full ${plan.tier === "pro" ? "border-amber-500/50 text-amber-400 hover:bg-amber-500/10" : plan.tier === "enterprise" ? "border-purple-500/50 text-purple-400 hover:bg-purple-500/10" : ""}`}
                  disabled={isPending}
                  onClick={() => handleSubscribe(plan.tier)}
                >
                  {isPending ? "Loading..." : plan.cta}
                </Button>
              )}
            </Card>
          ))}
        </div>

        {/* Token Packs */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl mb-2">Token Packs</h2>
            <p className="text-muted-foreground">Buy tokens to feature listings, unlock premium filters, and boost visibility</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TOKEN_PACKS.map((pack) => (
              <Card key={pack.tokens} className={`p-4 bg-card/80 border-border/30 text-center relative ${pack.popular ? "border-primary/50" : ""}`}>
                {pack.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-0 text-xs">Best Value</Badge>}
                <p className={`font-display text-3xl ${pack.color} mb-1`}>{pack.tokens.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mb-3">tokens · {pack.label}</p>
                <p className="font-display text-2xl mb-4">${pack.price}</p>
                <Button variant="outline" size="sm" className="w-full" disabled={isPending}
                  onClick={() => handleTokenPurchase(pack.tokens)}>
                  Buy Now
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl text-center mb-8">Billing FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "Can I cancel anytime?", a: "Yes. Cancel from your profile settings. You keep access until the end of your billing period." },
              { q: "What payment methods do you accept?", a: "All major credit/debit cards via Stripe. Apple Pay and Google Pay coming soon." },
              { q: "Do you offer refunds?", a: "Yes, within 7 days of purchase if you haven't used any paid features. Contact support." },
              { q: "Is there a free trial?", a: "The Free tier is free forever. No credit card required to start." },
            ].map((item, i) => (
              <Card key={i} className="p-4 bg-card/80 border-border/30">
                <p className="font-semibold text-sm mb-1">{item.q}</p>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
