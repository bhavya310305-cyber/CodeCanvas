import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const AIHighlight = () => {
  return (
    <section id="ai" className="py-24 bg-background relative">
      <div className="absolute inset-0 bg-gradient-to-b from-surface/40 to-transparent pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: "spring", stiffness: 180 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-6"
            >
              <Brain className="h-6 w-6 text-glow" />
            </motion.div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              AI that understands <span className="text-gradient">your code</span>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-xl mx-auto">
              CodeCanvas AI reads your snippets and explains what they do in plain
              language. It spots anti-patterns, suggests improvements, and helps you understand complex
              logic — line by line.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            className="mt-12 rounded-xl border border-border bg-card p-6 text-left hover:border-glow/20 hover:shadow-[0_0_40px_-10px_hsl(220_80%_60%/0.2)] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, type: "spring" }}
                className="w-3 h-3 rounded-full bg-destructive/60"
              />
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9, type: "spring" }}
                className="w-3 h-3 rounded-full bg-primary/40"
              />
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.0, type: "spring" }}
                className="w-3 h-3 rounded-full bg-glow/40"
              />
            </div>
            <pre className="text-sm text-muted-foreground font-mono overflow-x-auto">
              <code>{`// Your code
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

`}<span className="text-glow">// AI Explanation</span>{`
// This creates a debounce wrapper that delays
// function execution until after a period of
// inactivity. Useful for search inputs and
// resize handlers.`}</code>
            </pre>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIHighlight;
