import { create } from 'zustand'
import { nanoid } from '../../utils/nanoid'
import type { Conversation, Message, ModelParams } from './types'
import { createChat, streamChat } from '../providers/backend'
import { streamGemini } from '../providers/gemini'
import { loadConversations, saveConversations } from '../db/db'

type ChatState = {
  conversations: Conversation[]
  currentId: string
  get current(): Conversation
  params: ModelParams
  setParams: (p: Partial<ModelParams>) => void
  setCurrent: (id: string) => void
  createConversation: () => void
  renameConversation: (id: string, title: string) => void
  sendMessage: (text: string) => Promise<void>
}

const initialConv: Conversation = {
  id: nanoid(),
  title: 'New chat',
  messages: []
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: (awaitMaybe(loadConversations())) ?? [initialConv],
  currentId: initialConv.id,
  get current() {
    return get().conversations.find((c) => c.id === get().currentId) as Conversation
  },
  params: { model: 'gemini-1.5-flash-latest', temperature: 0.2 },
  setParams: (p) => set((s) => ({ params: { ...s.params, ...p } })),
  setCurrent: (id) => set({ currentId: id }),
  createConversation: () =>
    set((s) => ({
      conversations: [{ id: nanoid(), title: 'New chat', messages: [] }, ...s.conversations],
      currentId: s.conversations[0]?.id ?? s.currentId
    })),
  renameConversation: (id, title) =>
    set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? { ...c, title } : c)) })),
  sendMessage: async (text: string) => {
    const { conversations, currentId, params } = get()
    const conv = conversations.find((c) => c.id === currentId)!
    const userMsg: Message = { id: nanoid(), role: 'user', content: text, contentType: 'text', createdAt: Date.now() }
    const assistantMsg: Message = { id: nanoid(), role: 'assistant', content: '', contentType: 'markdown', createdAt: Date.now() }
    set({
      conversations: conversations.map((c) => (c.id === conv.id ? { ...c, messages: [...c.messages, userMsg, assistantMsg] } : c))
    })
    try {
      const MODE = (import.meta.env.VITE_DAISY_MODE as string) || 'server'
      const stream = MODE === 'client'
        ? streamGemini({ prompt: text, model: params.model, temperature: params.temperature })
        : (await (async () => {
            const { id } = await createChat({ prompt: text, model: params.model, temperature: params.temperature })
            return streamChat(id)
          })())
      for await (const chunk of stream) {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conv.id
              ? { ...c, messages: c.messages.map((m) => (m.id === assistantMsg.id ? { ...m, content: (m.content || '') + chunk } : m)) }
              : c
          )
        }))
      }
    } catch (e) {
      set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === conv.id
            ? {
                ...c,
                messages: c.messages.map((m) => (m.id === assistantMsg.id ? { ...m, content: 'Error: ' + (e as Error).message } : m))
              }
            : c
        )
      }))
    }
  }
}))

// Persist on any change
useChatStore.subscribe((state) => {
  void saveConversations(state.conversations)
})

function awaitMaybe<T>(p: Promise<T | null> | undefined): T | undefined {
  // This helper is a no-op placeholder so we can keep types. The actual async load should happen outside store in app init if needed.
  void p
  return undefined
}
