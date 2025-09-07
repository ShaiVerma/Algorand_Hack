import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import { CodeBlock } from './CodeBlock'

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      className="prose prose-invert max-w-none prose-pre:rounded-xl prose-pre:bg-secondary/50"
      rehypePlugins={[rehypeHighlight]}
      components={{ code: CodeBlock as any }}
    >
      {children}
    </ReactMarkdown>
  )
}

