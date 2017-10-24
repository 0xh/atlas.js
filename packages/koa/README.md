# @atlas.js/koa

Koa.js service and a Middleware hook loader for @atlas.js.

## Installation

`npm i @atlas.js/koa`

## Usage

### Service

The service configuration allows you to define three things:

- `listen`: A bind configuration, ie. to which host and port to bind
- `koa`: Koa configuration, ie. all the [properties you can set on the Koa instance][koa-settings]
- `server`: http configuration, ie. all the [properties you can set on the http server instance][http-settings]

```js
import { Atlas } from '@atlas.js/atlas'
import * as Koa from '@atlas.js/koa'

const atlas = new Atlas({
  config: {
    services: {
      http: {
        // Listen on this port and network interface
        listen: {
          port: 3000,
          hostname: '127.0.0.1',
        },
        // These are set on the http.Server instance
        server: {
          timeout: 30000,
        },
        // These are set on the Koa instance
        koa: {
          proxy: true,
        },
      }
    }
  }
})
atlas.service('http', Koa.Service)
await atlas.start()

// The Koa instance is now available here:
atlas.services.http
// And the http.Server instance is also exposed:
atlas.services.http.server
```

### MiddlewareHook

To add middleware to the Koa instance, it is recommended that this hook is used for that. It allows you to specify from which module the middleware should be loaded and adds it to Koa for you when the application starts.

#### MiddlewareHook Dependencies

- `service:koa`: A koa service to load the middleware into

```js
import { Atlas } from '@atlas.js/atlas'
import * as Koa from '@atlas.js/koa'

const atlas = new Atlas({
  config: {
    hooks: {
      middleware: {
        // The path to the module, relative to root, which should be loaded and
        // the exported middleware added to the Koa service
        module: 'middleware',
        middleware: {
          // You can define configuration options for your middleware here.
          // The key must match the exported middleware name.
        }
      }
    }
  }
})

atlas.service('http', Koa.Service)
atlas.hook('middleware', Koa.MiddlewareHook, {
  aliases: {
    'service:koa': 'http'
  }
})
await atlas.start()
```

#### Example middleware module

Here is an example middleware module that the `MiddlewareHook` expects to find.

```js
// middleware.js
import forcehttps from './forcehttps'
import routes from './routes'
import notfound from './notfound'

export {
  forcehttps,
  routes,
  notfound,
}
```

#### Accessing the Atlas instance

> The Atlas instance can be accessed through `ctx.atlas` in middleware or routes.

Here is an example middleware that makes use of the Atlas instance inside the route handler. It returns 400 status code with a custom message when the request is made on an insecure protocol.

```js
// middleware/forcehttps.js
export default function mkforcehttps(config) {
  return function forcehttps(ctx, next) {
    // Here you can access the Atlas instance via `ctx.atlas`
    if (ctx.atlas.env === 'production' && !ctx.secure) {
      ctx.response.status = 426
      ctx.response.set({
        Upgrade: 'TLS/1.2, HTTP/1.1',
        Connection: 'Upgrade',
      })
      ctx.response.body = {
        message: 'I refuse to talk to you while anyone may be listening.',
      }

      return
    }

    await next()
  }
}
```

### ContextHook

This hook allows you to extend the Koa context object prototype with custom functions or properties. It might be useful to define response type aliases, such as `ctx.ok()`, or `ctx.forbidden()`.

#### ContextHook Dependencies

- `service:koa`: A Koa service on which to extend the context

```js
const atlas = new Atlas({
  config: {
    hooks: {
      context: {
        // The path to the module, relative to root, which should be loaded and
        // properties/functions from that module added to koa.context
        module: 'server/context',
      }
    }
  }
})

atlas.service('http', Koa.Service)
atlas.hook('context', Koa.ContextHook, {
  aliases: {
    'service:koa': 'http'
  }
})
await atlas.start()

// server/context.js
export default {
  ok(body = {}) {
    this.status = 200
    this.body = body
  },

  forbidden() {
    this.status = 403
    this.body = {
      error: 'Forbidden'
    }
  }
}
```

## License

See the [LICENSE](LICENSE) file for information.

[koa-settings]: http://koajs.com/#settings
[http-settings]: https://nodejs.org/api/http.html#http_class_http_server
