"use client"

import type React from "react"

import { useState } from "react"
import DashboardNavbar from "@/components/dashboard/navbar"
import UserProfile from "@/components/dashboard/user-profile"
import IntentFeed from "@/components/dashboard/intent-feed"
import FloatingParticles from "@/components/floating-particles"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <FloatingParticles />
  <DashboardNavbar />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - User Profile */}
        <div className="hidden lg:flex w-80 border-r border-accent/20 bg-background/50 backdrop-blur-sm flex-col">
          <UserProfile isConnected={isWalletConnected} />
        </div>

        {/* Center Panel - Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">{children}</div>
        </div>

        {/* Right Panel - Intent Feed */}
        <div className="hidden xl:flex w-80 border-l border-accent/20 bg-background/50 backdrop-blur-sm flex-col">
          <IntentFeed />
        </div>
      </div>
    </div>
  )
}
