export type Role = 'user' | 'assistant' | 'system'

export type Message = {
  id: string
  role: Role
  content: string
  contentType: 'text' | 'markdown'
  createdAt: number
}

export type Conversation = {
  id: string
  title: string
  messages: Message[]
}

export type ModelParams = {
  model: string
  temperature: number
}

