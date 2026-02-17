import { Link } from "react-router-dom";
import { Droplets, MapPin, Activity, BarChart3, ArrowRight, Waves, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStations } from "@/hooks/useStations";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
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
  const totalStations = stations.length;
  const criticalCount = stations.filter(s => s.status === "Critical").length;
  const normalCount = stations.filter(s => s.status === "Normal").length;

  return (
    <div className="space-y-6 px-3 pt-1 pb-3 lg:px-5 lg:pt-1 lg:pb-5 max-w-7xl mx-auto">
      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-background border border-border px-5 py-10 lg:px-8 lg:py-16 text-center"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="flex items-center gap-2 mb-4 justify-center">
            <div className="p-2 rounded-lg bg-primary/20">
              <Droplets className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">AquaWatch India</span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-3xl lg:text-5xl font-display font-bold text-foreground leading-tight">
            Groundwater Intelligence for India
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-4 text-base lg:text-lg max-w-xl mx-auto">
            Monitor, predict, and analyze groundwater levels across India's Digital Water Level Recorder network in real-time.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3 mt-6 justify-center">
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
        <motion.div variants={fadeUp} custom={4} className="relative z-10 grid grid-cols-3 gap-4 mt-10 max-w-md mx-auto">
          <div className="text-center p-3 rounded-xl bg-card/80 border border-border">
            <p className="text-2xl lg:text-3xl font-display font-bold text-foreground">{totalStations.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Active Stations</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-card/80 border border-border">
            <p className="text-2xl lg:text-3xl font-display font-bold text-success">{normalCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Normal</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-card/80 border border-border">
            <p className="text-2xl lg:text-3xl font-display font-bold text-destructive">{criticalCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Critical</p>
          </div>
        </motion.div>
      </motion.section>

      {/* Features */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
      >
        <motion.h2 variants={fadeUp} custom={0} className="text-xl font-display font-bold text-foreground mb-5">Platform Capabilities</motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title} variants={fadeUp} custom={i + 1} className="p-5 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
              <div className="p-2.5 rounded-lg bg-primary/10 w-fit">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mt-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* About the Project */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
        className="rounded-2xl bg-card border border-border p-6 lg:p-8"
      >
        <motion.h2 variants={fadeUp} custom={0} className="text-xl font-display font-bold text-foreground mb-2">About the Project</motion.h2>
        <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-sm lg:text-base leading-relaxed max-w-3xl">
          AquaWatch India is an intelligent groundwater monitoring platform built to track and predict water levels across India's vast network of Digital Water Level Recorders (DWLRs). Developed to address growing concerns about groundwater depletion, the platform provides real-time insights, AI-driven forecasts, and early warning systems to help policymakers, researchers, and communities make informed decisions about water resource management.
        </motion.p>
        <motion.div variants={fadeUp} custom={2} className="flex flex-wrap gap-2 mt-4">
          {["React", "TypeScript", "LSTM Neural Networks", "Leaflet Maps", "Recharts", "Tailwind CSS"].map(tag => (
            <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
              {tag}
            </span>
          ))}
        </motion.div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
      >
        <motion.h2 variants={fadeUp} custom={0} className="text-xl font-display font-bold text-foreground mb-5">How It Works</motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "01", title: "Data Collection", description: "DWLR stations across India continuously record groundwater levels and transmit data in real-time." },
            { step: "02", title: "AI Processing", description: "LSTM neural networks analyze historical patterns to generate accurate water level predictions up to 90 days ahead." },
            { step: "03", title: "Actionable Insights", description: "Interactive dashboards, maps, and alerts help stakeholders monitor trends and respond to critical changes." },
          ].map((item, i) => (
            <motion.div key={item.step} variants={fadeUp} custom={i + 1} className="relative p-5 rounded-xl bg-card border border-border">
              <span className="text-4xl font-display font-bold text-primary/15">{item.step}</span>
              <h3 className="font-display font-semibold text-foreground mt-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Quick Links */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
      >
        <motion.h2 variants={fadeUp} custom={0} className="text-xl font-display font-bold text-foreground mb-5">Quick Access</motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, i) => (
            <motion.div key={link.path} variants={fadeUp} custom={i + 1}>
              <Link
                to={link.path}
                className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="p-2.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <link.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 ml-auto group-hover:text-primary transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
