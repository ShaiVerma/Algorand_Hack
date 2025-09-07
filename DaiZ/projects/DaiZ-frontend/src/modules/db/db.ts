import { get, set } from 'idb-keyval'
import type { Conversation } from '../chat/types'

const KEY = 'daisy:conversations:v1'

export async function loadConversations(): Promise<Conversation[] | null> {
  return (await get(KEY)) as Conversation[] | null
}

export async function saveConversations(conversations: Conversation[]) {
  await set(KEY, conversations)
}

