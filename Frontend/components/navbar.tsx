"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Github, Twitter, MessageCircle, ChevronDown } from "lucide-react"
// lightweight MetaMask connect fallback (doesn't require Wagmi/RainbowKit)

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSocials, setShowSocials] = useState(false)

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50)
  }

  typeof window !== "undefined" && window.addEventListener("scroll", handleScroll)

  const socialLinks = [
    { label: "GitHub", href: "#", icon: Github },
    { label: "Twitter", href: "#", icon: Twitter },
    { label: "Discord", href: "#", icon: MessageCircle },
  ]

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md border-b border-accent/20" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent"
        >
          🥭 Mango.tree
        </motion.div>

        <div className="hidden md:flex gap-8 items-center">
          <motion.a
            href="/"
            whileHover={{ color: "#FFB84D" }}
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            Home
          </motion.a>

          <motion.a
            href="/docs"
            whileHover={{ color: "#FFB84D" }}
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            Docs
          </motion.a>

          <div className="relative">
            <motion.button
              onClick={() => setShowSocials(!showSocials)}
              whileHover={{ color: "#FFB84D" }}
              className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
            >
              Socials
              <ChevronDown className={`w-4 h-4 transition-transform ${showSocials ? "rotate-180" : ""}`} />
            </motion.button>

            {/* Socials dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={showSocials ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full right-0 mt-2 w-48 rounded-lg bg-background/95 backdrop-blur-md border border-accent/20 shadow-lg overflow-hidden ${
                showSocials ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              {socialLinks.map((link) => {
                const Icon = link.icon
                return (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    whileHover={{ backgroundColor: "rgba(255, 184, 77, 0.1)" }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-accent transition-colors border-b border-accent/10 last:border-b-0"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </motion.a>
                )
              })}
            </motion.div>
          </div>
        </div>

        <div className="hidden md:block">
          <motion.button
            onClick={async () => {
              if (typeof window === 'undefined') return
              const anyWin = window as any
              if (!anyWin.ethereum) {
                // no injected provider
                window.open('https://metamask.io/download/', '_blank')
                return
              }
              try {
                const accounts = await anyWin.ethereum.request({ method: 'eth_requestAccounts' })
                // you can dispatch an event or set localStorage for other app parts to consume
                console.log('Connected', accounts && accounts[0])
              } catch (err) {
                console.error('User rejected or error', err)
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-accent to-primary text-background font-semibold text-sm hover:shadow-lg hover:shadow-accent/50 transition-all"
          >
            Connect Wallet
          </motion.button>
        </div>
      </div>
    </motion.nav>
  )
}
