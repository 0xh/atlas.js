import Component from '@atlas.js/component'

/**
 * Base service class all other services should inherit from
 */
class Service extends Component {
  static type = 'service'

  prepare() {}
  start() {}
  stop() {}
}

export default Service
