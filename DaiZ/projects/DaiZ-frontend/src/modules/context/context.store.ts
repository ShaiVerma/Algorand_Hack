import { create } from 'zustand'

type WebResult = { title: string; url: string; snippet: string }
type FileItem = { name: string; size: number }

type ContextState = {
  webResults: WebResult[]
  files: FileItem[]
  systemPrompt: string
  addWebResult: (r: WebResult) => void
  setSystemPrompt: (p: string) => void
}

const defaultSystemPrompt = `You are DAISY, a helpful, concise AI.
- Cite sources when using web context.
- Prefer Markdown with code fences for code.`

export const useContextStore = create<ContextState>((set) => ({
  webResults: [],
  files: [],
  systemPrompt: defaultSystemPrompt,
  addWebResult: (r) => set((s) => ({ webResults: [...s.webResults, r] })),
  setSystemPrompt: (p) => set({ systemPrompt: p })
}))

