import React from "react";
import { motion } from "framer-motion";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/login" },
      { label: "Get Started", href: "/register" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.color = "#ffffff";
};

const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.color = "rgba(255,255,255,0.45)";
};

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-display text-sm font-bold">
                Code<span style={{ color: "#3b82f6" }}>Canvas</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              An AI-powered workspace for developers who want to write better code.
            </p>
            <div style={{
              marginTop: 16,
              height: 1,
              width: 40,
              background: "linear-gradient(90deg, #3b82f6, transparent)",
              borderRadius: 999,
            }} />
          </div>

          {/* Link columns */}
          {footerLinks.map((group, gi) => (
            <div key={group.title}>
              <h4
                className="text-sm font-semibold mb-4"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link, li) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: gi * 0.1 + li * 0.07 }}
                  >
                    <a  
                      href={link.href}
                      className="group relative inline-flex items-center gap-1.5 text-xs transition-colors"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <span
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          background: "#3b82f6",
                          flexShrink: 0,
                          opacity: 0,
                          transform: "scale(0)",
                          transition: "all 0.2s ease",
                        }}
                        className="group-hover:!opacity-100 group-hover:!scale-100"
                      />
                      {link.label}
                      <span
                        style={{
                          position: "absolute",
                          bottom: -2,
                          left: 12,
                          height: 1,
                          width: "0%",
                          borderRadius: 999,
                          background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                          transition: "width 0.25s ease",
                        }}
                        className="group-hover:!w-full"
                      />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            {`© ${new Date().getFullYear()} CodeCanvas. Built with care.`}
          </p>
          <div className="flex items-center gap-1.5">
            <div style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 6px 1px rgba(34,197,94,0.5)",
            }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              All systems operational
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;