export function About() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 text-sm">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">About DAISY</h2>
        <p>
          DAISY (Decentralized. Artificial. Intelligence. Search. for You.) is a modern, privacy-first interface for the Gemini API, with optional web context and local-first storage.
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="font-medium">Algorand Builders</h3>
        <p>
          Explore the Algorand Developer Portal and Algokit docs to build smart contracts and integrate on-chain data into your workflows.
        </p>
        <ul className="list-disc pl-6">
          <li><a className="hover:underline" href="https://dev.algorand.co/getting-started/introduction" target="_blank">Algorand Developer Portal</a></li>
          <li><a className="hover:underline" href="https://developer.algorand.org/docs/" target="_blank">Algokit & Docs</a></li>
        </ul>
      </section>
      <section className="space-y-2">
        <h3 className="font-medium">License</h3>
        <p>MIT (placeholder). Add your policy and details here.</p>
      </section>
    </div>
  )
}

