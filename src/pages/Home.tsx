import { Link } from "react-router-dom";
import { Droplets, MapPin, Activity, BarChart3, ArrowRight, Waves, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStations } from "@/hooks/useStations";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const features = [
  {
    icon: MapPin,
    title: "23,900+ Stations",
    description: "Real-time monitoring of DWLR stations across every state in India.",
  },
  {
    icon: Activity,
    title: "LSTM Predictions",
    description: "AI-powered water level forecasting up to 90 days ahead with 87% accuracy.",
  },
  {
    icon: Waves,
    title: "Live Tracking",
    description: "Continuous groundwater level data with trend analysis and anomaly detection.",
  },
  {
    icon: Shield,
    title: "Early Warnings",
    description: "Automated critical and warning alerts for declining water levels.",
  },
];

const quickLinks = [
  { label: "Dashboard", path: "/dashboard", icon: BarChart3, description: "Overview & statistics" },
  { label: "Station Map", path: "/map", icon: MapPin, description: "Interactive India map" },
  { label: "Predictions", path: "/predictions", icon: Activity, description: "AI water forecasts" },
  { label: "Analytics", path: "/analytics", icon: BarChart3, description: "Trends & insights" },
];

export default function Home() {
  const { data: stations = [] } = useStations();
  const { user, logout } = useAuth();
  const totalStations = stations.length;
  const criticalCount = stations.filter(s => s.status === "Critical").length;
  const normalCount = stations.filter(s => s.status === "Normal").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <Droplets className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display font-bold text-foreground">AquaWatch India</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">{user.displayName || user.email}</span>
                <Button variant="ghost" size="sm" onClick={() => logout()} className="gap-1.5 text-muted-foreground">
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-5">
        {/* Hero */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-background border border-border px-5 py-10 lg:px-8 lg:py-14 text-center"
        >
          <div className="absolute top-0 right-0 w-60 h-60 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.h1 variants={fadeUp} custom={0} className="text-3xl lg:text-5xl font-display font-bold text-foreground leading-tight">
              Groundwater Intelligence for India
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground mt-3 text-base lg:text-lg max-w-xl mx-auto">
              Monitor, predict, and analyze groundwater levels across India's Digital Water Level Recorder network in real-time.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-wrap gap-3 mt-5 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/dashboard">
                  Open Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/map">
                  <MapPin className="h-4 w-4" /> Explore Map
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Live stats */}
          <motion.div variants={fadeUp} custom={3} className="relative z-10 grid grid-cols-3 gap-3 mt-8 max-w-sm mx-auto">
            <div className="text-center p-2.5 rounded-xl bg-card/80 border border-border">
              <p className="text-xl lg:text-2xl font-display font-bold text-foreground">{totalStations.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Active Stations</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-card/80 border border-border">
              <p className="text-xl lg:text-2xl font-display font-bold text-success">{normalCount.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Normal</p>
            </div>
            <div className="text-center p-2.5 rounded-xl bg-card/80 border border-border">
              <p className="text-xl lg:text-2xl font-display font-bold text-destructive">{criticalCount.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Critical</p>
            </div>
          </motion.div>
        </motion.section>

        {/* Features */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}>
          <motion.h2 variants={fadeUp} custom={0} className="text-lg font-display font-bold text-foreground mb-4">Platform Capabilities</motion.h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i + 1} className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm mt-2.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}>
          <motion.h2 variants={fadeUp} custom={0} className="text-lg font-display font-bold text-foreground mb-4">How It Works</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { step: "01", title: "Data Collection", description: "DWLR stations continuously record groundwater levels and transmit data in real-time." },
              { step: "02", title: "AI Processing", description: "LSTM neural networks analyze historical patterns to generate accurate predictions up to 90 days ahead." },
              { step: "03", title: "Actionable Insights", description: "Interactive dashboards, maps, and alerts help stakeholders monitor trends and respond to changes." },
            ].map((item, i) => (
              <motion.div key={item.step} variants={fadeUp} custom={i + 1} className="relative p-4 rounded-xl bg-card border border-border">
                <span className="text-3xl font-display font-bold text-primary/15">{item.step}</span>
                <h3 className="font-display font-semibold text-foreground text-sm mt-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Quick Links */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}>
          <motion.h2 variants={fadeUp} custom={0} className="text-lg font-display font-bold text-foreground mb-4">Quick Access</motion.h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickLinks.map((link, i) => (
              <motion.div key={link.path} variants={fadeUp} custom={i + 1}>
                <Link
                  to={link.path}
                  className="group flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                    <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm">{link.label}</p>
                    <p className="text-[11px] text-muted-foreground">{link.description}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 ml-auto shrink-0 group-hover:text-primary transition-colors hidden sm:block" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
