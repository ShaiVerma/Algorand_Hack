import { Conversation } from '../../../modules/chat/types'
import { Markdown } from '../../../components/markdown/Markdown'

export function Chat({ conversation }: { conversation: Conversation }) {
  return (
    <div className="space-y-4 p-4">
      {conversation.messages.map((m) => (
        <div key={m.id} className="flex gap-3">
          <div className={`mt-1 h-7 w-7 shrink-0 rounded-full ${m.role === 'user' ? 'bg-sky-600' : 'bg-emerald-600'}`} />
          <div className="max-w-3xl flex-1">
            <div className="mb-1 text-xs text-muted-foreground">
              {m.role.toUpperCase()} • {new Date(m.createdAt).toLocaleTimeString()}
            </div>
            {m.contentType === 'markdown' ? (
              <Markdown>{m.content}</Markdown>
            ) : (
              <p className="whitespace-pre-wrap">{m.content}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

