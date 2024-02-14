/**
 * @type {import('next').NextConfig}
 */


const nextConfig = {
  // output: 'standalone',
  async rewrites() {
    return {
      beforeFiles: [
        // These rewrites are checked after headers/redirects
        // and before all files including _next/public files which
        // allows overriding page files
        {
          source: '/this/:path*',
          destination: '/:one/:path*',
          has: [
            {
              type: 'header',
              key: 'one',
              value: '(?<one>.*)',
            },
          ],
        },
        // {
        //   source: '/:first/:second',
        //   destination: '/:first?second=:second',
        // },
      ],
      afterFiles: [
        // These rewrites are checked after pages/public files
        // are checked but before dynamic routes
        {
          source: '/after',
          destination: '/somewhere-else',
        },
      ],
      fallback: [
        // These rewrites are checked after both pages/public files
        // and dynamic routes are checked
        {
          source: '/fallback/:path*',
          destination: `https://my-old-site.com/:path*`,
        },
      ],
    }
  },
  async redirects() {
    return [
      {
        source: '/bar/:path',
        destination: '/:path',
        permanent: true,
      },
    ]
  },
  // output: 'standalone',
  async headers() {
    return [
      {
        source: '/foo',
        headers: [
          {
            key: 'x-foo',
            value: 'some-foo',
          },
          {
            key: 'x-bar',
            value: 'some-bar',
          },
        ],
      },
    ]
  },
  cacheHandler: cr(),
  cacheMaxMemorySize: 0,
}

module.exports = nextConfig

function cr() {
  if (process.env.ATLAS_CACHE_HANDLER_ENABLED !== undefined) {
    return require.resolve('./.atlas/atlas-cache-handler.js')
  }

  console.log("USING REPO LOCAL CACHE HANDLER")
  return require.resolve('./local-cache-handler.js')
}
