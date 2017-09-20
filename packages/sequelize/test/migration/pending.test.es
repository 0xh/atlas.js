import Umzug from 'umzug'
import { MigrationAction as Migration } from '../..'
import mksequelizemock from './sequelizemock'

describe('Migration::pending()', () => {
  let migration
  let database

  beforeEach(function() {
    this.sandbox.stub(Umzug.prototype, 'pending').resolves(['001-first', '002-second'])
    database = mksequelizemock()
    migration = new Migration({
      app: {
        root: __dirname,
      },
      log: {},
      config: {
        module: 'testmigrations',
      },
      resolve() { return database },
    })
  })


  it('exists', () => {
    expect(migration).to.respondTo('pending')
  })

  it('returns all the not-yet applied migrations', async () => {
    const pending = await migration.pending()

    expect(pending).to.have.length(2)
  })
})
