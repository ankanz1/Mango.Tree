"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"

export default function Hero() {
  const [isHovered, setIsHovered] = useState<string | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center z-10"
      >
        <motion.div variants={itemVariants} className="mb-8">
          
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent"
        >
          Bet Smarter. Win Anywhere.
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          A cross-chain betting experience built on Celo. Trustless, instant, and powered by NEAR Intents.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center">
          {[
            { label: "Launch App", primary: true, href: "/app" },
            { label: "Connect Wallet", primary: false, href: "#" },
          ].map((btn) => (
            <div
              key={btn.label}
              onMouseEnter={() => setIsHovered(btn.label)}
              onMouseLeave={() => setIsHovered(null)}
            >
              <Link
                href={btn.href}
                className={`px-8 py-4 rounded-full font-semibold text-lg transition-all inline-block ${
                  btn.primary
                    ? "bg-gradient-to-r from-accent to-primary text-background hover:shadow-lg hover:shadow-accent/50"
                    : "border-2 border-accent text-accent hover:bg-accent/10"
                }`}
              >
                <motion.span animate={isHovered === btn.label ? { x: 5 } : { x: 0 }}>{btn.label}</motion.span>
              </Link>
            </div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="mt-16 pt-16 border-t border-accent/20">
          <p className="text-sm text-muted-foreground mb-8">Trusted by Web3 builders</p>
          <div className="flex justify-center gap-8 flex-wrap">
            {["Celo", "NEAR", "Vercel"].map((partner) => (
              <motion.div key={partner} whileHover={{ scale: 1.1 }} className="text-muted-foreground font-semibold">
                {partner}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
