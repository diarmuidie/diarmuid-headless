import Image from 'next/image'
import styles from '../page.module.css'
import { headers } from 'next/headers'
import Link from 'next/link'

async function getData() {
  const res = await fetch('https://api.openbrewerydb.org/v1/breweries/random?size=1', { next: { revalidate: 15, tags: ["brew"] } })

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }

  return res.json()
}

export default async function Home() {

  const data = await getData()
  const headersList = headers()
  const referer = (await headersList).get('referer')

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className={styles.grid}>
        <Link href="/app-router/static" className={styles.card}>
          <h2>
          Static<span>-&gt;</span>
          </h2>
        </Link>
      </div>

      <div className={styles.grid}>
        <h2>
          {data[0].name}
        </h2>
      </div>
    </main>
  )
}
