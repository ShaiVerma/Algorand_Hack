import { useChatStore } from '../../modules/chat/chat.store'
import { Toolbar } from './toolbar/Toolbar'
import { Chat } from './chat/Chat'
import { InputBar } from './chat/InputBar'

export function Workspace() {
  const { current } = useChatStore()
  const isEmpty = current.messages.length === 0
  return (
    <div className="flex h-full flex-col">
      <Toolbar />
      <div className="min-h-0 flex-1 overflow-auto">
        {isEmpty ? (
          <div className="grid h-full place-items-center p-6">
            <div className="text-center">
              <h1 className="mb-4 text-7xl font-extrabold tracking-tight">
                <span className="text-foreground">D.</span>
                <span className="text-[hsl(47,100%,61%)]">A.I</span>
                <span className="text-foreground">.S.Y</span>
              </h1>
              <p className="mb-4 text-2xl text-muted-foreground whitespace-nowrap">Decentralized. Artificial. Intelligence. Search. For. You.</p>
              <p className="mb-4 text-3xl font-semibold text-[hsl(356,81%,60%)]">Connect your wallet to start</p>
              <div className="mx-auto max-w-5xl"><InputBar /></div>
            </div>
          </div>
        ) : (
          <Chat conversation={current} />
        )}
      </div>
      {!isEmpty && (
        <div className="border-t p-3"><InputBar /></div>
      )}
    </div>
  )
}
