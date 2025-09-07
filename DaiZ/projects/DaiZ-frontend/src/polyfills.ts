// Minimal browser polyfills for Node globals used by some deps
// - global: map to globalThis for libraries expecting Node's `global`
// - Buffer: provide browser-compatible Buffer implementation

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Buffer as BufferPolyfill } from 'buffer'

if (typeof (globalThis as any).global === 'undefined') {
  ;(globalThis as any).global = globalThis
}

if (typeof (globalThis as any).Buffer === 'undefined') {
  ;(globalThis as any).Buffer = BufferPolyfill
}

