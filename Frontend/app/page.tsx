"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import HowItWorks from "@/components/how-it-works"
import LiveBetsFeed from "@/components/live-bets-feed"
import CrossChainPayout from "@/components/cross-chain-payout"
import Roadmap from "@/components/roadmap"
import Footer from "@/components/footer"
import FloatingParticles from "@/components/floating-particles"
import CursorFollower from "@/components/cursor-follower"

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <FloatingParticles />
      <CursorFollower position={mousePosition} />
      <Navbar />
      <Hero />
      <HowItWorks />
      <LiveBetsFeed />
      <CrossChainPayout />
      <Roadmap />
      <Footer />
    </main>
  )
}
