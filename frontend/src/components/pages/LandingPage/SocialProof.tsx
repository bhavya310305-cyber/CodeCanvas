import { motion } from "framer-motion";

const SocialProof = () => {
  return (
    <section className="py-12 border-y border-border">
      <div className="container mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center text-sm text-muted-foreground"
        >
          CodeCanvas is a lightweight platform where developers can
          create, explore, and enhance code snippets with smart AI assistance.
        </motion.p>
      </div>
    </section>
  );
};

export default SocialProof;
