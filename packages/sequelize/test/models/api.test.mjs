import path from 'path'
import { ModelsHook } from '../..'
import Sequelize from 'sequelize'
import * as testmodels from '../testmodels'

describe('Sequelize: ModelsHook', () => {
  let hook
  let database

  before(() => {
    database = new Sequelize('sqlite://test-db.sqlite', { operatorsAliases: {} })
  })

  after(() =>
    database.close())

  beforeEach(() => {
    hook = new ModelsHook({
      atlas: {
        root: __dirname,
        // eslint-disable-next-line global-require
        require: location => require(path.resolve(__dirname, location)),
      },
      log: { debug() {} },
      config: {
        module: '../testmodels',
      },
      component() { return database },
    })
  })


  it('exists', () => {
    expect(ModelsHook).to.be.a('function')
  })

  it('defines its required components', () => {
    expect(ModelsHook.requires).to.eql([
      'service:sequelize',
    ])
  })

  it('implements `afterPrepare`', () => {
    expect(hook).to.respondTo('afterPrepare')
  })


  describe('afterPrepare', () => {
    it('loads all models from the specified module location', async () => {
      await hook.afterPrepare()

      for (const [name, Model] of Object.entries(testmodels)) {
        expect(database.models).to.have.property(name, Model)
      }
    })

    it('passes the fields and config to the Model.init() function', async function() {
      // Sanity check
      expect(Object.values(testmodels).length).to.be.greaterThan(0)

      for (const Model of Object.values(testmodels)) {
        this.sandbox.stub(Model, 'init').returns()
      }

      await hook.afterPrepare()

      for (const Model of Object.values(testmodels)) {
        expect(Model.init).to.have.callCount(1)
        expect(Model.init).to.have.been.calledWith(
          Model.fields,
          { sequelize: database, ...Model.config },
        )
      }
    })
  })
})
