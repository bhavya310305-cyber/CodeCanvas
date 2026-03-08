import { motion } from "framer-motion";
import { Code2, Tags, Eye } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "AI Code Improvement",
    description: "Paste any snippet and get instant suggestions to make it cleaner, faster, and more idiomatic.",
  },
  {
    icon: Tags,
    title: "Tag-Based Organization",
    description: "Organize with tags. Filter instantly. One snippet can belong to many categories at once.",
  },
  {
    icon: Eye,
    title: "Live Frontend Preview",
    description: "Write HTML, CSS, or JavaScript and see the output instantly. Copy to clipboard or export as a file — all without leaving the workspace.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background relative">
      {/* Subtle gradient overlay to unify color with hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface/40 to-transparent pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Everything you need to level up</h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            A focused set of tools designed for learning, experimenting, and shipping.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="rounded-xl border border-border bg-card p-8 hover:border-glow/30 hover:shadow-[0_0_30px_-5px_hsl(220_80%_60%/0.15)] transition-colors"
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 + 0.3, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-5"
              >
                <feature.icon className="h-5 w-5 text-glow" />
              </motion.div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;