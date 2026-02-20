import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { MessageSquare, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react";

function Nav() {
  const { user, isAuthenticated } = useAuth();
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/90">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/"><span className="font-display text-2xl text-primary cursor-pointer">Rentable</span></Link>
        <div className="flex gap-3 items-center">
          {isAuthenticated ? (
            <Link href="/profile"><Button variant="outline" size="sm">{user?.name?.split(" ")[0]}</Button></Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

const FAQ_ITEMS = [
  { q: "How does Rentable work?", a: "Browse listings, request to rent, the owner confirms, you meet up (or get delivery), use the item, return it. Simple as that. We handle the trust layer so you don't have to." },
  { q: "What if an item gets damaged?", a: "Both parties agree on the item's condition before and after. We recommend documenting with photos. For high-value items, consider our damage protection add-on (coming soon)." },
  { q: "How does the barter system work?", a: "If a listing has barter enabled, you can offer to trade an item instead of paying cash. The owner reviews your offer and accepts or declines. No money changes hands — pure peer-to-peer exchange." },
  { q: "What is Emergency Mode?", a: "During declared disasters, emergency-tagged listings (generators, water pumps, safety gear) are surfaced prominently. Price gouging is algorithmically blocked — prices are capped at pre-emergency rates." },
  { q: "What is the Weird Vault?", a: "Our curated collection of the most unusual, delightful, and inexplicable rentals on the platform. Emotional support goats, haunted mirrors, astronaut suits. You know, the essentials." },
  { q: "How do tokens work?", a: "Tokens are Rentable's internal currency. Earn them by completing rentals, leaving reviews, and referring friends. Spend them to feature your listings, unlock premium filters, or boost visibility." },
  { q: "Is my payment secure?", a: "Yes. All payments are processed through Stripe, a PCI-DSS Level 1 certified payment processor. We never store your card details." },
  { q: "How do I become verified?", a: "Complete your profile, verify your email, and complete 3 successful rentals. Verified listings get a badge and rank higher in search results." },
  { q: "What are Neighborhood Circles?", a: "Hyper-local sharing groups where neighbors share resources. Join or create a circle for your block, building, or community. Lower prices, higher trust, less driving." },
  { q: "Can I list anything?", a: "Almost. No illegal items, no weapons, no live animals (except pre-approved emotional support animals with proper documentation). When in doubt, list it and we'll review it." },
];

export default function Support() {
  const { isAuthenticated, user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");

  const createTicket = trpc.support.create.useMutation({
    onSuccess: () => { setSubmitted(true); toast.success("Support ticket submitted!"); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!name || !email || !subject || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createTicket.mutate({ name, email, subject, message, category: (category === "technical" ? "bug" : category) as "general" | "billing" | "listing" | "rental" | "safety" | "bug" | "other" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="font-display text-5xl text-foreground mb-4">Support Center</h1>
          <p className="text-muted-foreground text-lg">We're real humans who actually read your messages. Usually within 24 hours.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ */}
          <div>
            <h2 className="font-display text-2xl mb-4">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-card/80 border border-border/30 rounded-lg px-4">
                  <AccordionTrigger className="text-sm font-medium text-left hover:text-primary transition-colors">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-display text-2xl mb-4">Contact Support</h2>
            {submitted ? (
              <Card className="p-8 text-center bg-green-950/30 border-green-500/30">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="font-display text-2xl text-green-400 mb-2">Ticket Submitted!</h3>
                <p className="text-muted-foreground mb-4">We'll get back to you within 24 hours at <strong>{email}</strong>.</p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>Submit Another</Button>
              </Card>
            ) : (
              <Card className="p-6 bg-card/80 border-border/30">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Name *</label>
                      <Input value={name} onChange={e => setName(e.target.value)} className="bg-background border-border/50" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Email *</label>
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-background border-border/50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Subject *</label>
                    <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="What's going on?" className="bg-background border-border/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="bg-background border-border/50"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card border-border/50">
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="listing">Listing Issue</SelectItem>
                          <SelectItem value="rental">Rental Issue</SelectItem>
                          <SelectItem value="safety">Safety Concern</SelectItem>
                          <SelectItem value="bug">Technical / Bug</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Priority</label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="bg-background border-border/50"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card border-border/50">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Message *</label>
                    <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue in detail..." className="bg-background border-border/50" rows={5} />
                  </div>
                  <Button variant="default" className="w-full gap-2" disabled={createTicket.isPending} onClick={handleSubmit}>
                    {createTicket.isPending ? <><RefreshCw className="w-4 h-4 animate-spin" /> Submitting...</> : <><MessageSquare className="w-4 h-4" /> Submit Ticket</>}
                  </Button>
                </div>
              </Card>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Card className="p-4 bg-card/50 border-border/20 text-center">
                <p className="text-2xl mb-1">⚡</p>
                <p className="font-semibold text-sm">Response Time</p>
                <p className="text-xs text-muted-foreground">Usually under 24 hours</p>
              </Card>
              <Card className="p-4 bg-card/50 border-border/20 text-center">
                <p className="text-2xl mb-1">🔒</p>
                <p className="font-semibold text-sm">Privacy First</p>
                <p className="text-xs text-muted-foreground">Your data stays yours</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
