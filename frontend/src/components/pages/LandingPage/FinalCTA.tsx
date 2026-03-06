import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  return (
    <section className="py-24 bg-surface/20 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/60 pointer-events-none" />
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold max-w-lg mx-auto">
            Stop losing your best code. Start building with clarity.
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 text-muted-foreground max-w-md mx-auto"
          >
            
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8"
          >
            {/* <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Button variant="hero" size="lg">Get Started for Free</Button>
            </motion.div> */}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
