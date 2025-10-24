"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

export default function Roadmap() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  const features = [
    { title: "On-chain Fairness", description: "Transparent, verifiable outcomes" },
    { title: "Solver Marketplace", description: "Decentralized bet resolution" },
    { title: "Open-source Oracle", description: "Community-powered data feeds" },
    { title: "Multi-chain Integration", description: "Seamless cross-chain experience" },
    { title: "Mobile App", description: "Bet on the go" },
    { title: "DAO Governance", description: "Community-driven development" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section ref={ref} className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Why Mango.tree
          </h2>
          <p className="text-xl text-muted-foreground">Built for the future of Web3 gaming</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants} whileHover={{ y: -5 }} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative p-6 rounded-xl border border-accent/30 bg-background/40 backdrop-blur-md hover:border-accent/60 transition-all duration-300">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                  className="text-3xl mb-4"
                >
                  ✓
                </motion.div>
                <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
