import Image from 'next/image'
import styles from '../page.module.css'
import Link from 'next/link'

async function getData() {
  const res = await fetch('https://api.openbrewerydb.org/v1/breweries/random?size=1', { next: { revalidate: 15, tags: ["brew"] } })

  const res1 = res.clone()
  
  console.log("res headers")
  console.log(res1.headers)
  console.log(res1.status)
  console.log("res.text()")
  const responseBody = await res1.text();
  console.log(responseBody);
  console.log("res.json()")
  const resbody = await res1.json()
  console.log(resbody)
  console.log("res.json() done")

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }

  return resbody
}

export default async function Home() {
  const data = await getData()

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
        <Link href="/app-router/dynamic" className={styles.card}>
          <h2>
          Dynamic<span>-&gt;</span>
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
