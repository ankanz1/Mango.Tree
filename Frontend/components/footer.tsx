"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Github, Twitter, MessageCircle, BookOpen, Volume2, VolumeX } from "lucide-react"

export default function Footer() {
  const [soundEnabled, setSoundEnabled] = useState(false)

  const footerLinks = [
    { label: "Docs", href: "#", icon: BookOpen },
    { label: "GitHub", href: "#", icon: Github },
    { label: "Twitter", href: "#", icon: Twitter },
    { label: "Discord", href: "#", icon: MessageCircle },
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <footer className="border-t border-accent/20 bg-gradient-to-t from-background via-background/80 to-background/40 backdrop-blur-md py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl opacity-30"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-12 mb-12"
        >
          {/* Brand */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              🥭 Mango.tree
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Trustless betting on Celo. Powered by NEAR Intents and built for the future of decentralized gaming.
            </p>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-xs text-accent font-semibold"
            >
              Built with on Celo
            </motion.div>
          </motion.div>

          {/* Links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="font-semibold text-lg">Resources</h4>
            <div className="space-y-3">
              {footerLinks.map((link) => {
                const Icon = link.icon
                return (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    whileHover={{ x: 8, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{link.label}</span>
                  </motion.a>
                )
              })}
            </div>
          </motion.div>

          {/* Settings */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="font-semibold text-lg">Settings</h4>
            <motion.button
              onClick={() => setSoundEnabled(!soundEnabled)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                soundEnabled
                  ? "bg-gradient-to-r from-accent to-primary text-background shadow-lg shadow-accent/50"
                  : "bg-muted/20 text-muted-foreground hover:bg-muted/40 border border-muted/30"
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  Sound On
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  Sound Off
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent mb-8 origin-left"
        />

        {/* Footer Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-2"
        >
          <p className="text-muted-foreground text-sm">© 2025 Mango.tree — Decentralized Betting Protocol</p>
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="text-xs bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent font-semibold"
          >
            Built on Celo. Powered by NEAR Intents.
          </motion.p>
        </motion.div>
      </div>
    </footer>
  )
}
