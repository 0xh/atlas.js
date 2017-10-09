import http from 'http'
import Service from '@atlas.js/service'
import { FrameworkError } from '@atlas.js/errors'
import Koa from 'koa'

class KoaService extends Service {
  static defaults = {
    listen: {
      port: 3000,
      hostname: '127.0.0.1',
    },

    server: {
      // Overriden in this implementation to have lower value
      // These days most of the people deploy to Heroku and they have a request timeout of 30s
      timeout: 30000,
      // Defaults for Node.js
      maxHeadersCount: 2000,
      keepAliveTimeout: 5000,
    },

    koa: {
      proxy: false,
    },
  }


  prepare(options) {
    super.prepare(options)

    // Prepare Koa instance
    const koa = new Koa()
    koa.env = this.atlas.env
    koa.context.atlas = this.atlas
    koa.context.log = this.log

    // Apply Koa settings
    Object.assign(koa, this.config.koa)

    return koa
  }

  async start(koa) {
    const config = this.config
    const server = http.createServer(koa.callback())
    koa.server = server

    // Apply server configuration
    Object.assign(server, config.server)

    // Ugh, events to Promise mapping is so ugly... 🤦
    await new Promise((resolve, reject) => {
      function ok() {
        server.removeListener('error', fail)
        return void resolve()
      }
      function fail(err) {
        server.removeListener('listening', ok)
        return void reject(err)
      }
      server.once('listening', ok)
      server.once('error', fail)

      // Listen already!
      koa.server.listen(config.listen.port, config.listen.hostname)
    })

    this.log.info({ addrinfo: server.address() }, 'listening')
  }

  async stop(koa) {
    if (!koa || !koa.server) {
      throw new FrameworkError('Cannot stop a non-running server')
    }

    const server = koa.server
    const addrinfo = server.address()

    await new Promise((resolve, reject) => {
      server.close(err => {
        err ? reject(err) : resolve()
      })
    })

    this.log.info({ addrinfo }, 'closed')
  }
}

export default KoaService
