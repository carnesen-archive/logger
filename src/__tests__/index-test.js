import pkg from '../../package.json'
import { should } from 'chai'
import sinon from 'sinon'

should()

import { Logger, ConsoleTransport, DebugTransport, Transport } from '../index'

class SpyTransport extends Transport {
  constructor () {
    super()
    this.spy = sinon.spy()
  }
  write (logApi) {
    this.spy(logApi)
  }
 }

describe(pkg.name, function () {
  it('Logger has no default transports', function () {
    const log = new Logger()
    log.listeners.length.should.equal(0)
  })

  it('Logger can add ConsoleTransport', function () {
    sinon.spy(console, 'log')
    const log = new Logger()
    const transport = new ConsoleTransport({ level: 'error' })
    log.add(transport)
    log.debug()
    log.info()
    log.warn()
    log.error()
    console.log.calledOnce.should.equal(true) // eslint-disable-line no-console
    console.log.restore() // eslint-disable-line no-console
  })

  it('Logger can add DebugTransport', function () {
    const log = new Logger()
    const transport = new DebugTransport({ level: 'error' })
    log.add(transport)
    log.debug()
    log.info()
    log.warn()
    log.error()
  })

  it('A logger can pipe to other loggers', function () {
    const fooLog = new Logger('foo')
    const barLog = new Logger('bar')
    fooLog.pipe(barLog)
    const transport = new SpyTransport()
    barLog.add(transport)
    const args = ['foo', 'bar']
    fooLog.info(...args)
    transport.spy.calledOnce.should.equal(true)
    const listenerApi = transport.spy.firstCall.args[0]
    listenerApi.level.should.equal('info')
    listenerApi.args.should.deep.equal(args)
    listenerApi.timestamp.valueOf().should.be.below((new Date()).valueOf() + 10)
  })
})
