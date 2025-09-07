import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-gradient-to-br from-yellow-950 via-slate-900 to-slate-950">
      <GradientMesh />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass relative z-10 mx-4 max-w-2xl rounded-2xl p-8 text-center scale-[1.10]"
      >
        <h1 className="mb-2 text-6xl font-extrabold tracking-tight">
          <span className="text-foreground">D.</span>
          <span className="text-[hsl(47,100%,61%)]">A.I</span>
          <span className="text-foreground">.S.Y</span>
        </h1>
        <p className="mx-auto mb-7 max-w-xl text-balance text-muted-foreground text-lg">
          Decentralized. Artificial. Intelligence. Search. For. You.
        </p>
        <Link
          to="/app"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-90"
        >
          Open DAISY
        </Link>
      </motion.div>
    </div>
  )
}

function GradientMesh() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -left-1/3 -top-1/3 h-[60vmax] w-[60vmax] rounded-full bg-yellow-400/20 blur-3xl" />
      <div className="absolute left-1/4 top-1/2 h-[30vmax] w-[30vmax] -translate-y-1/2 rounded-full bg-amber-200/10 blur-3xl" />
    </div>
  )
}
