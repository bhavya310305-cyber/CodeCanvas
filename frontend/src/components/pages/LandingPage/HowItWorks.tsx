import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Paste or write your code", description: "Drop any snippet into your workspace. Supports all major languages." },
  { number: "02", title: "Let AI analyze it", description: "Get instant explanations, improvement suggestions, and best practice tips." },
  { number: "03", title: "Save, export, and reuse", description: "Organize your snippets with tags. Copy to clipboard or export as a file and access them anywhere, anytime." },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-surface/20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/60 pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold">How it works</h2>
          <p className="mt-4 text-muted-foreground">Three steps. Zero complexity.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: i === 0 ? -40 : i === 2 ? 40 : 0, y: i === 1 ? 40 : 0 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center"
            >
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.25 + 0.2, type: "spring", stiffness: 150 }}
                className="font-display text-5xl font-bold text-gradient inline-block"
              >
                {step.number}
              </motion.span>
              <h3 className="font-display text-lg font-semibold mt-4 mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;