import Head from 'next/head'

export default function Home({preview}) {
  return (
    <div className="container">
      <Head>
        <title>Server</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          λ (Server) server-side rendered page {preview}
        </h1>
        <p>Visit <a href="/api/preview">/api/preview</a> to enable and <a href="/api/clear-preview">/api/clear-preview</a> to disable preview mode</p>
      </main>
    </div>
  )
}

export async function getServerSideProps(context) {
  let preview = "(preview mode disabled)"

  const used = process.memoryUsage()
  console.log(used)
  console.log(process.env.NODE_OPTIONS)
  if (context.preview) {
    preview = "(preview mode enabled)"
  }

  return {
    props: {
      "used": used,
    },
  }
}
