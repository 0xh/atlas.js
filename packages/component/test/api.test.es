import Component from '..'

describe('Component: basics and API', () => {
  it('exists', () => {
    expect(Component).to.be.a('function')
  })

  it('can be constructed', () => {
    expect(() => new Component()).to.not.throw()
  })

  it('has a static defaults property with an empty object', () => {
    expect(Component.defaults).to.be.an('object')
    expect(Object.keys(Component.defaults)).to.have.length(0)
  })

  xit('implements methods each Component should have', () => {
    const component = new Component()

    expect(component).to.respondTo('component')
  })

  it('saves app and log objects given on constructor to itself', () => {
    const app = { app: true }
    const log = { log: true }
    const component = new Component({
      app,
      log,
    })

    expect(component).to.have.property('app', app)
    expect(component).to.have.property('log', log)
  })
})
