import Application from '..'
import Service from '@atlas.js/service'
import Hook from '@atlas.js/hook'

class DummyService extends Service {}

class DummyAction {}

class DummyHook extends Hook {}

describe('Application::stop()', () => {
  let app
  let options

  beforeEach(() => {
    options = {
      root: __dirname,
      config: {
        application: {
          log: {
            level: 'warn',
          },
        },
        services: {
          dummy: {
            test: true,
          },
        },
        hooks: {
          dummy: {
            test: true,
          },
        },
      },
    }
    app = new Application(options)
    app.service('dummy', DummyService)
    app.action('dummy', DummyAction)
    app.hook('dummy', DummyHook)

    return app.start()
  })


  it('is async', () => {
    expect(app.stop()).to.be.instanceof(Promise)
  })

  it('returns this', async () => {
    expect(await app.stop()).to.equal(app)
  })

  it('sets app.started and app.prepared to false', async () => {
    expect(app.started).to.equal(true)
    expect(app.prepared).to.equal(true)
    await app.stop()
    expect(app.started).to.equal(false)
    expect(app.prepared).to.equal(false)
  })


  describe('Service interactions', () => {
    beforeEach(() => {
      DummyService.prototype.stop = sinon.stub().resolves()
    })


    it('calls stop on the service', async () => {
      await app.stop()
      expect(DummyService.prototype.stop).to.have.callCount(1)
    })

    it('passes the exposed instance to the stop() method on the service', async function() {
      const instance = { test: true }
      this.sandbox.stub(DummyService.prototype, 'prepare').resolves(instance)

      app = new Application(options)
      app.service('dummy', DummyService)

      await app.start()
      await app.stop()

      expect(DummyService.prototype.stop).to.have.been.calledWith(instance)
    })

    it('calls the method only once for each service for multiple .stop() calls', async () => {
      await app.stop()
      await app.stop()

      expect(DummyService.prototype.stop).to.have.callCount(1)
    })

    it('removes getters for services', async () => {
      expect(app.services).to.have.property('dummy')
      await app.stop()
      expect(app.services).to.not.have.property('dummy')
    })
  })


  describe('Service interactions - dispatching events', () => {
    const events = [
      'application:stop:before',
      'application:stop:after',
    ]

    beforeEach(() => {
      DummyService.prototype.prepare = sinon.stub().resolves()

      // Stub out all the event handlers
      for (const event of events) {
        DummyHook.prototype[event] = sinon.stub().resolves()
      }
    })

    it('calls the stop hooks', async () => {
      await app.stop()

      for (const event of events) {
        expect(DummyHook.prototype[event]).to.have.callCount(1)
      }
    })

    it('calls the application:stop:before hook with the application instance', async () => {
      const proto = DummyHook.prototype
      await app.stop()

      expect(proto['application:stop:before']).to.have.been.calledWith(app)
    })

    it('calls the application:stop:after hook with null', async () => {
      const proto = DummyHook.prototype
      await app.stop()
      const args = proto['application:stop:after'].lastCall.args

      expect(args).to.have.length(1)
      expect(args[0]).to.equal(null)
    })
  })


  describe('Action interactions', () => {
    it('removes the action from this.actions', async () => {
      // Sanity check
      expect(app.actions).to.have.property('dummy')

      await app.stop()
      expect(app.actions).to.not.have.property('dummy')
    })
  })
})
