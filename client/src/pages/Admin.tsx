import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Package, Calendar, BarChart2, Settings, RefreshCw, Shield, Flag, CheckCircle, XCircle, MessageSquare } from "lucide-react";

function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/90">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/"><span className="font-display text-2xl text-primary cursor-pointer">Rentable</span></Link>
        <div className="flex gap-3 items-center">
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Admin Panel</Badge>
          <Link href="/profile"><Button variant="outline" size="sm">{user?.name?.split(" ")[0]}</Button></Link>
          <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>
        </div>
      </div>
    </nav>
  );
}

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [banReason, setBanReason] = useState("");
  const [banUserId, setBanUserId] = useState<number | null>(null);
  const [ticketNotes, setTicketNotes] = useState<Record<number, string>>({});

  const { data: dashboard, isLoading: dashLoading } = trpc.admin.getDashboard.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.getUsers.useQuery({}, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: listings, isLoading: listingsLoading, refetch: refetchListings } = trpc.admin.getListings.useQuery({}, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: rentals, isLoading: rentalsLoading } = trpc.admin.getRentals.useQuery({}, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: tickets, isLoading: ticketsLoading, refetch: refetchTickets } = trpc.admin.getTickets.useQuery({}, { enabled: isAuthenticated && user?.role === "admin" });

  const promoteUser = trpc.admin.promoteUser.useMutation({
    onSuccess: () => { toast.success("User promoted to admin."); refetchUsers(); },
    onError: (e) => toast.error(e.message),
  });

  const banUser = trpc.admin.banUser.useMutation({
    onSuccess: () => { toast.success("User banned."); setBanUserId(null); setBanReason(""); refetchUsers(); },
    onError: (e) => toast.error(e.message),
  });

  const unbanUser = trpc.admin.unbanUser.useMutation({
    onSuccess: () => { toast.success("User unbanned."); refetchUsers(); },
    onError: (e) => toast.error(e.message),
  });

  const removeListing = trpc.admin.removeListing.useMutation({
    onSuccess: () => { toast.success("Listing removed."); refetchListings(); },
    onError: (e) => toast.error(e.message),
  });

  const approveListing = trpc.admin.approveListing.useMutation({
    onSuccess: () => { toast.success("Listing approved."); refetchListings(); },
    onError: (e) => toast.error(e.message),
  });

  const updateTicket = trpc.admin.updateTicket.useMutation({
    onSuccess: () => { toast.success("Ticket updated."); refetchTickets(); },
    onError: (e) => toast.error(e.message),
  });

  if (loading) return (
    <div className="min-h-screen bg-background text-foreground"><Nav />
      <div className="flex items-center justify-center py-24"><RefreshCw className="animate-spin text-primary w-8 h-8" /></div>
    </div>
  );

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground"><Nav />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="font-display text-4xl mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-8">You need admin privileges to access this page.</p>
          <Link href="/"><Button variant="default">Go Home</Button></Link>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    open: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    resolved: "bg-green-500/20 text-green-400 border-green-500/30",
    closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-gray-500/20 text-gray-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-orange-500/20 text-orange-400",
    urgent: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-red-400" />
          <h1 className="font-display text-4xl">Admin Panel</h1>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="bg-card/50 border border-border/30 mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="dashboard" className="gap-1"><BarChart2 className="w-4 h-4" /> Dashboard</TabsTrigger>
            <TabsTrigger value="users" className="gap-1"><Users className="w-4 h-4" /> Users</TabsTrigger>
            <TabsTrigger value="listings" className="gap-1"><Package className="w-4 h-4" /> Listings</TabsTrigger>
            <TabsTrigger value="rentals" className="gap-1"><Calendar className="w-4 h-4" /> Rentals</TabsTrigger>
            <TabsTrigger value="tickets" className="gap-1"><MessageSquare className="w-4 h-4" /> Support</TabsTrigger>
            <TabsTrigger value="settings" className="gap-1"><Settings className="w-4 h-4" /> Settings</TabsTrigger>
          </TabsList>

          {/* DASHBOARD */}
          <TabsContent value="dashboard">
            {dashLoading ? (
              <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-primary w-6 h-6" /></div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Users", value: dashboard?.users ?? 0, icon: Users, color: "text-primary" },
                    { label: "Total Listings", value: dashboard?.listings ?? 0, icon: Package, color: "text-amber-400" },
                    { label: "Total Rentals", value: dashboard?.rentals ?? 0, icon: Calendar, color: "text-green-400" },
                    { label: "Open Tickets", value: dashboard?.openTickets ?? 0, icon: MessageSquare, color: "text-red-400" },

                  ].map(stat => (
                    <Card key={stat.label} className="p-4 bg-card/80 border-border/30 text-center">
                      <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                      <p className={`font-display text-3xl ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </Card>
                  ))}
                </div>


              </div>
            )}
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users">
            <h2 className="font-display text-xl mb-4">User Management</h2>
            {usersLoading ? (
              <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-primary w-6 h-6" /></div>
            ) : (
              <div className="space-y-2">
                {users?.map(u => (
                  <Card key={u.id} className="p-4 bg-card/80 border-border/30">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{(u.name || "U")[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{u.name || "Anonymous"}</p>
                            <Badge variant="outline" className="text-xs capitalize">{u.role}</Badge>
                            <Badge variant="outline" className="text-xs capitalize">{u.subscriptionTier}</Badge>
                            {u.isBanned && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Banned</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{u.email} · Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {u.role !== "admin" && (
                          <Button variant="outline" size="sm" disabled={promoteUser.isPending}
                            onClick={() => { if (confirm(`Promote ${u.name} to admin?`)) promoteUser.mutate({ userId: u.id }); }}>
                            Promote
                          </Button>
                        )}
                        {!u.isBanned ? (
                          banUserId === u.id ? (
                            <div className="flex gap-2 items-center">
                              <Input value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Reason..." className="bg-background border-border/50 h-8 text-xs w-32" />
                              <Button variant="destructive" size="sm" disabled={banUser.isPending}
                                onClick={() => banUser.mutate({ userId: u.id, reason: banReason })}>
                                Confirm
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setBanUserId(null)}>Cancel</Button>
                            </div>
                          ) : (
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300"
                          onClick={() => { setBanUserId(u.id); setBanReason(""); }}>Ban</Button>
                          )
                        ) : (
                          <Button variant="outline" size="sm" disabled={unbanUser.isPending}
                            onClick={() => unbanUser.mutate({ userId: u.id })}>Unban</Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* LISTINGS */}
          <TabsContent value="listings">
            <h2 className="font-display text-xl mb-4">Listing Moderation</h2>
            {listingsLoading ? (
              <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-primary w-6 h-6" /></div>
            ) : (
              <div className="space-y-2">
                {listings?.map(l => (
                  <Card key={l.id} className="p-4 bg-card/80 border-border/30">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Link href={`/listing/${l.id}`}><p className="font-medium text-sm hover:text-primary transition-colors">{l.title}</p></Link>
                          <Badge variant="outline" className="text-xs capitalize">{l.category}</Badge>
                          <Badge variant="outline" className={l.availability === "available" ? "text-green-400 border-green-500/30 text-xs" : "text-red-400 border-red-500/30 text-xs"}>{l.availability}</Badge>
                          {l.isFlagged && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs"><Flag className="w-3 h-3 mr-1" />Flagged</Badge>}
                          {l.isVerified && <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">${parseFloat(l.pricePerDay as string).toFixed(2)}/day · {l.location} · {l.viewCount} views</p>
                        {l.isFlagged && l.flagReason && <p className="text-xs text-red-400 mt-1">Flag reason: {l.flagReason}</p>}
                      </div>
                      <div className="flex gap-2">
                        {!l.isVerified && (
                          <Button variant="outline" size="sm" className="text-green-400 border-green-500/30" disabled={approveListing.isPending}
                            onClick={() => approveListing.mutate({ id: l.id })}>
                            <CheckCircle className="w-3 h-3 mr-1" /> Verify
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" disabled={removeListing.isPending}
                          onClick={() => { if (confirm("Remove this listing?")) removeListing.mutate({ id: l.id, reason: "Admin removed" }); }}>
                          <XCircle className="w-3 h-3 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* RENTALS */}
          <TabsContent value="rentals">
            <h2 className="font-display text-xl mb-4">All Rentals</h2>
            {rentalsLoading ? (
              <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-primary w-6 h-6" /></div>
            ) : (
              <div className="space-y-2">
                {rentals?.map(r => (
                  <Card key={r.id} className="p-4 bg-card/80 border-border/30">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${r.status === "completed" ? "bg-green-500/20 text-green-400 border-green-500/30" : r.status === "canceled" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                            {r.status.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${r.paymentStatus === "paid" ? "text-green-400 border-green-500/30" : "text-yellow-400 border-yellow-500/30"}`}>{r.paymentStatus}</Badge>
                        </div>
                        <p className="text-sm">Listing #{r.listingId} · Renter #{r.renterId}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-display text-xl text-primary">${parseFloat(r.totalPrice as string).toFixed(2)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* SUPPORT TICKETS */}
          <TabsContent value="tickets">
            <h2 className="font-display text-xl mb-4">Support Tickets</h2>
            {ticketsLoading ? (
              <div className="flex justify-center py-8"><RefreshCw className="animate-spin text-primary w-6 h-6" /></div>
            ) : (
              <div className="space-y-3">
                {tickets?.map(t => (
                  <Card key={t.id} className="p-4 bg-card/80 border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge className={statusColors[t.status] || "text-xs"}>{t.status.replace("_", " ")}</Badge>
                            <Badge className={`text-xs ${priorityColors[t.priority] || ""}`}>{t.priority}</Badge>
                            <Badge variant="outline" className="text-xs capitalize">{t.category}</Badge>
                          </div>
                          <p className="font-medium text-sm">{t.subject}</p>
                          <p className="text-xs text-muted-foreground">{t.name} · {t.email}</p>
                          <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 bg-card/50 p-3 rounded-lg border border-border/20">{t.message}</p>
                      {t.adminNotes && <p className="text-xs text-primary bg-primary/10 p-2 rounded border border-primary/20">Admin: {t.adminNotes}</p>}
                      <div className="flex gap-2 flex-wrap items-center">
                        <Select value={t.status} onValueChange={(v) => updateTicket.mutate({ id: t.id, status: v as "open" | "in_progress" | "resolved" | "closed", adminNotes: ticketNotes[t.id] || t.adminNotes || undefined })}>
                          <SelectTrigger className="bg-background border-border/50 h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-card border-border/50">
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={t.priority} onValueChange={(v) => updateTicket.mutate({ id: t.id, priority: v as "low" | "medium" | "high" | "urgent" })}>
                          <SelectTrigger className="bg-background border-border/50 h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-card border-border/50">
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={ticketNotes[t.id] || ""}
                          onChange={e => setTicketNotes(n => ({ ...n, [t.id]: e.target.value }))}
                          placeholder="Admin notes..."
                          className="bg-background border-border/50 h-8 text-xs flex-1 min-w-32"
                        />
                        <Button variant="outline" size="sm" className="h-8 text-xs" disabled={updateTicket.isPending}
                          onClick={() => updateTicket.mutate({ id: t.id, adminNotes: ticketNotes[t.id] || undefined })}>
                          Save Note
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {(!tickets || tickets.length === 0) && (
                  <Card className="p-8 text-center bg-card/50 border-border/20">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No support tickets. All clear! 🎉</p>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings">
            <h2 className="font-display text-xl mb-4">Platform Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-card/80 border-border/30">
                <h3 className="font-semibold mb-3">Emergency Mode</h3>
                <p className="text-sm text-muted-foreground mb-3">Activate platform-wide emergency mode to surface disaster-related listings and block price gouging.</p>
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                  Activate Emergency Mode
                </Button>
              </Card>
              <Card className="p-4 bg-card/80 border-border/30">
                <h3 className="font-semibold mb-3">Featured Listings</h3>
                <p className="text-sm text-muted-foreground mb-3">Manage which listings appear in the featured section on the homepage.</p>
                <Link href="/search"><Button variant="outline">Browse & Feature Listings</Button></Link>
              </Card>
              <Card className="p-4 bg-card/80 border-border/30">
                <h3 className="font-semibold mb-3">Token Economy</h3>
                <p className="text-sm text-muted-foreground mb-3">Adjust token earn rates, bonus events, and spending multipliers.</p>
                <Button variant="outline" onClick={() => toast.info("Token settings coming soon")}>Configure Tokens</Button>
              </Card>
              <Card className="p-4 bg-card/80 border-border/30">
                <h3 className="font-semibold mb-3">Notifications</h3>
                <p className="text-sm text-muted-foreground mb-3">Send platform announcements to all users.</p>
                <Button variant="outline" onClick={() => toast.info("Broadcast notifications coming soon")}>Send Announcement</Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
