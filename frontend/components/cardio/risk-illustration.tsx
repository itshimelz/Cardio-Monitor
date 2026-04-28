"use client"

import { motion } from "framer-motion"

type RiskIllustrationProps = {
  highRisk: boolean
}

export function RiskIllustration({ highRisk }: RiskIllustrationProps) {
  const heartColor = highRisk ? "#ef4444" : "#10b981"
  const lineColor = highRisk ? "#f87171" : "#34d399"

  return (
    <div className="relative mx-auto flex h-56 w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background/40">
      <motion.svg
        viewBox="0 0 320 220"
        className="h-full w-full"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.path
          d="M50 130 L90 130 L108 102 L132 156 L156 120 L178 130 L270 130"
          fill="none"
          stroke={lineColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 0.6 }}
        />
        <motion.path
          d="M160 178 C120 150 84 120 84 92 C84 72 100 56 120 56 C136 56 150 64 160 78 C170 64 184 56 200 56 C220 56 236 72 236 92 C236 120 200 150 160 178 Z"
          fill={heartColor}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
          style={{ transformOrigin: "160px 115px" }}
        />
      </motion.svg>
      <div className="pointer-events-none absolute bottom-3 right-4 font-mono text-xs text-muted-foreground">
        {highRisk ? "!! risk-signal-high !!" : "== heart-rate-stable =="}
      </div>
    </div>
  )
}
