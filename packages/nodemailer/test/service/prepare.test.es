import nodemailer from 'nodemailer'
import { Service as Nodemailer } from '../..'

describe('Nodemailer::prepare()', () => {
  let service
  let transport
  let config

  beforeEach(function() {
    transport = {
      transporter: { name: 'loltransport' },
    }
    config = {
      transport: sinon.stub(),
      options: {
        someval: true,
      },
      defaults: {
        default: true,
      },
    }
    this.sb.each.stub(nodemailer, 'createTransport').returns(transport)

    service = new Nodemailer({
      log: {
        child: sinon.stub(),
      },
      config,
    })
  })


  it('exists', () => {
    expect(service).to.respondTo('prepare')
  })

  it('returns the client created by createTransport', async () => {
    expect(await service.prepare()).to.equal(transport)
  })

  it('gives the initialised transporter to createTransport as first arg', async () => {
    const transporter = { transporter: true }
    config.transport.returns(transporter)
    await service.prepare()
    const args = nodemailer.createTransport.lastCall.args

    expect(args[0]).to.equal(transporter)
  })

  it('applies default email options from config.defaults', async () => {
    await service.prepare()
    const args = nodemailer.createTransport.lastCall.args

    expect(args[1]).to.equal(config.defaults)
  })

  it('creates the transport with the config data at options', async () => {
    await service.prepare()

    expect(config.transport).to.have.callCount(1)
    expect(config.transport).to.have.been.calledWith(config.options)
  })

  it('configures and applies plugins defined in config', async () => {
    transport.use = sinon.stub()
    config.plugins = [{
      plugin: sinon.stub(),
      event: 'compile',
      options: {},
    }, {
      plugin: sinon.stub(),
      event: 'stream',
      options: {},
    }]
    service = new Nodemailer({
      log: {
        child: sinon.stub(),
      },
      config,
    })

    await service.prepare()

    expect(transport.use).to.have.callCount(config.plugins.length)

    config.plugins.forEach((plugin, index) => {
      const call = transport.use.getCall(index)
      expect(call.args[0]).to.equal(plugin.event)
      expect(plugin.plugin).to.have.callCount(1)
      expect(plugin.plugin).to.have.been.calledWith(plugin.options)
    })
  })
})
