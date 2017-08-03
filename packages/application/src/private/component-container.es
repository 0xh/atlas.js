import hidden from 'local-scope/create'
import { FrameworkError } from '@theframework/errors'
import { defaultsDeep as defaults } from 'lodash'

/**
 * This class holds and manages a component
 *
 * @private
 */
class ComponentContainer {
  /**
   * Create new container for a component
   *
   * @param     {Object}        info              Component information
   * @param     {String}        info.type         The component's type (service, hook, action)
   * @param     {String}        info.alias        The component's user-specified name/alias
   * @param     {Object}        info.aliases      Binding information from the user to locate other
   *                                              components
   * @param     {Class}         info.Component    The component class
   * @param     {Object}        info.config       The component's user-specified configuration
   * @param     {Application}   app               The Application instance
   */
  constructor(info, app) {
    this.type = info.type
    this.alias = info.alias
    this.aliases = info.aliases
    this.Component = info.Component

    if (typeof this.Component !== 'function') {
      throw new FrameworkError(`Component must be a class, got ${typeof this.Component}`)
    }

    this.component = new this.Component({
      app,
      log: app.log.child({ [this.type]: this.alias }),
      config: defaults(info.config, this.Component.defaults),
      resolve,
    })

    // Save the aliases for this component
    this.component::hidden().aliases = this.aliases
  }
}

function resolve(name) {
  const resolved = this::hidden().aliases[name]

  if (!resolved) {
    throw new FrameworkError(`Binding for ${name} not defined`)
  }

  const [type] = name.split(':')
  const keys = { service: 'services', action: 'actions', hook: 'hooks' }
  const component = this.app[keys[type]][resolved]

  if (!component) {
    throw new FrameworkError(`Unable to find ${type} ${resolved} bound as ${name}`)
  }

  return component
}

export default ComponentContainer
