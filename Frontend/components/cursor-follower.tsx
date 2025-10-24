"use client"

import { motion } from "framer-motion"

interface CursorFollowerProps {
  position: { x: number; y: number }
}

export default function CursorFollower({ position }: CursorFollowerProps) {
  return (
    <motion.div
      className="fixed w-8 h-8 rounded-full border-2 border-accent pointer-events-none -z-10"
      animate={{
        x: position.x - 16,
        y: position.y - 16,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 28,
      }}
    />
  )
}
