const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const meta = require('next/dist/server/request-meta')
var express = require('express')

const hostname = 'localhost'
const port = 8080
var router = express.Router()
var theThing = null

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev: false, hostname, port })
const handle = app.getRequestHandler()

void app.prepare().then(() => {
  createServer(async (req, res) => {
    console.log(req.url)

    rewroteURL = meta.getRequestMeta(req)
    console.log('meta:', rewroteURL)
    console.log('====================')

    res.setHeader('x-diarmuid', 'true')

    var replaceThing = function() {
      originalThing = theThing
      var unused = function() {
        if (originalThing) {
          console.log("hi")
        }
      }
      theThing = {
        longStr: new Array(1000000).join('*'),
        someMethod: function() {
          console.log("someMessage")
        }
      }
    }

    router.get('/leak', function(req, res) {
      replaceThing()
      return res.json({message: "Hello World!"})
    })

    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url ?? '', true)

      // console.log(req)
      // console.log('====================')
      // console.log(res)

      await handle(req, res, parsedUrl)
      rewroteURL = meta.getRequestMeta(req)
      console.log('meta:', rewroteURL)
      
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
