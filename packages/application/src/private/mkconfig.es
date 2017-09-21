import path from 'path'
import {
  defaultsDeep as defaults,
  merge,
} from 'lodash'
import { optrequire } from '.'

/**
 * Create the configuration object from inputs
 *
 * For path-based configs, we additionally want to support:
 * - loading and applying environment overrides on top of the base config
 * - loading and applying local (per-machine) overrides on top of the config
 *
 * This pattern is frequent-enough that it warrants explicit support in core.
 *
 * @private
 * @param     {Object}    config        Base config object, or a string (path) to a module where
 *                                      the config should be loded from, relative to root
 * @param     {Object}    base          Default values to be added to the config object if they are
 *                                      missing from the input config
 * @return    {Object}
 */
function mkconfig(config = {}, base = {}) {
  if (typeof config === 'string') {
    const modules = {
      // eslint-disable-next-line global-require
      config: optrequire(path.resolve(this.root, config)),
      env: optrequire(path.resolve(this.root, config, 'env', this.env)),
      local: optrequire(path.resolve(this.root, config, 'local')),
    }

    modules.config = merge(modules.config, modules.env, modules.local)
    modules.config = defaults(modules.config, base)

    return modules.config
  }

  // It's just an object, apply defaults and GTFO
  return defaults(config, base)
}

export default mkconfig
