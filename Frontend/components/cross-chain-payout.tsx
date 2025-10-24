"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

export default function CrossChainPayout() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  const chains = ["Celo", "Polygon", "Arbitrum", "Optimism"]

  return (
    <section ref={ref} className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Instant Payouts
          </h2>
          <p className="text-xl text-muted-foreground">No bridges. No wait. Just results.</p>
        </motion.div>

        

        {/* Supported chains */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-8">Supported chains</p>
          <div className="flex flex-wrap justify-center gap-4">
            {chains.map((chain) => (
              <motion.div
                key={chain}
                whileHover={{ scale: 1.1 }}
                className="px-6 py-3 rounded-full border border-accent/30 bg-background/40 backdrop-blur-md hover:border-accent/60 transition-all"
              >
                {chain}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
