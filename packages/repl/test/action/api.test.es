import { Action as Repl } from '../..'
import Action from '@theframework/action'

describe('Action: Repl', () => {
  it('exists', () => {
    expect(Action).to.be.a('function')
  })

  it('extends @theframework/action', () => {
    expect(new Repl()).to.be.instanceof(Action)
  })

  it('defines its defaults', () => {
    expect(Repl.defaults).to.have.all.keys([
      'historyFile',
      'username',
      'prompt',
      'newlines',
      'greet',
    ])
  })
})
