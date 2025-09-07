import { useEffect, useRef } from 'react'

export function CodeBlock({ inline, className, children, ...props }: any) {
  const match = /language-(\w+)/.exec(className || '')
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const pre = preRef.current
    if (!pre) return
    const btn = pre.querySelector('button')
    if (btn) return
    const copy = document.createElement('button')
    copy.textContent = 'Copy'
    copy.className = 'absolute right-2 top-2 rounded-lg bg-background/70 px-2 py-1 text-xs'
    copy.onclick = async () => {
      await navigator.clipboard.writeText(String(children))
      copy.textContent = 'Copied!'
      setTimeout(() => (copy.textContent = 'Copy'), 1200)
    }
    pre.style.position = 'relative'
    pre.appendChild(copy)
  }, [children])

  if (inline) return <code className={className} {...props}>{children}</code>

  return (
    <pre ref={preRef}>
      <code className={className}>
        {children}
      </code>
    </pre>
  )
}

