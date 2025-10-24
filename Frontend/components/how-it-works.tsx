"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

export default function HowItWorks() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  const steps = [
    {
      number: "01",
      title: "Create a Bet",
      description: "Set your terms, amount, and opponent. Smart contracts handle the rest.",
      icon: "📝",
    },
    {
      number: "02",
      title: "Accept & Lock",
      description: "Opponent accepts and funds are locked in escrow. No middleman needed.",
      icon: "🔒",
    },
    {
      number: "03",
      title: "Auto-Payout",
      description: "NEAR Intents resolve the bet and Celo handles instant payouts.",
      icon: "💰",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
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
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">Three simple steps to trustless betting</p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div key={step.number} variants={itemVariants} whileHover={{ y: -10 }} className="group relative">
              {/* Glassy card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative p-8 rounded-2xl border border-accent/30 bg-background/40 backdrop-blur-md hover:border-accent/60 transition-all duration-300">
                

                <div className="text-5xl font-bold text-accent/40 mb-4">{step.number}</div>

                <h3 className="text-2xl font-bold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>

                {index < steps.length - 1 && (
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="hidden md:block absolute -right-12 top-1/2 transform -translate-y-1/2 text-accent text-2xl"
                  >
                    →
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
