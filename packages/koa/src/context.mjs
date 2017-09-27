import Hook from '@atlas.js/hook'
import { FrameworkError } from '@atlas.js/errors'

class ContextHook extends Hook {
  static defaults = {
    module: 'koa-context',
  }

  static requires = [
    'service:koa',
  ]

  'application:prepare:after'() {
    const koa = this.component('service:koa')
    const mod = this.app.require(this.config.module)
    // Prefer default export or a standard CommonJS module
    const context = mod.default
      ? mod.default
      : mod

    for (const [name, func] of Object.entries(context)) {
      if (name in koa.context) {
        throw new FrameworkError(`Unable to extend koa.context with ${name} - property exists`)
      }

      koa.context[name] = func
    }
  }
}

export default ContextHook
