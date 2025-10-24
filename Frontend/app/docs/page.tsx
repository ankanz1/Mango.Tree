"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import AboutModal from "@/components/about-modal"
import FloatingParticles from "@/components/floating-particles"

export default function DocsPage() {
  const [showModal, setShowModal] = useState(true)

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <FloatingParticles />
      <Navbar />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Documentation
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Learn everything about Mango.tree, our decentralized betting platform built on Celo.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card/50 backdrop-blur border border-accent/20 rounded-lg p-8 hover:border-accent/50 transition-all">
              <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
              <p className="text-muted-foreground mb-6">
                New to Mango.tree? Learn the basics of how to place bets, predict outcomes, and earn rewards on our
                decentralized platform.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="text-accent hover:text-primary transition-colors font-semibold"
              >
                Learn More →
              </button>
            </div>

            <div className="bg-card/50 backdrop-blur border border-accent/20 rounded-lg p-8 hover:border-accent/50 transition-all">
              <h2 className="text-2xl font-bold mb-4">Platform Rules</h2>
              <p className="text-muted-foreground mb-6">
                Understand the rules, oracle verification process, and how payouts work across different blockchain
                networks.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="text-accent hover:text-primary transition-colors font-semibold"
              >
                View Rules →
              </button>
            </div>

            <div className="bg-card/50 backdrop-blur border border-accent/20 rounded-lg p-8 hover:border-accent/50 transition-all">
              <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
              <p className="text-muted-foreground mb-6">
                Check out the top performers on Mango.tree and see how you stack up against other players.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="text-accent hover:text-primary transition-colors font-semibold"
              >
                View Leaderboard →
              </button>
            </div>

            <div className="bg-card/50 backdrop-blur border border-accent/20 rounded-lg p-8 hover:border-accent/50 transition-all">
              <h2 className="text-2xl font-bold mb-4">Cross-Chain Payouts</h2>
              <p className="text-muted-foreground mb-6">
                Learn how our cross-chain solver enables seamless payouts across Celo, Polygon, Ethereum, and more.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="text-accent hover:text-primary transition-colors font-semibold"
              >
                Learn More →
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && <AboutModal onClose={() => setShowModal(false)} />}
      <Footer />
    </main>
  )
}
