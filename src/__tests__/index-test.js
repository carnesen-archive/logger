import { should } from 'chai'
import sinon from 'sinon'

should()

import createLogger from '../index'

describe('createLogger', function () {
  it('debug logs by default', function () {
    // TODO
  })

  it('logs to console if options.console is true', function () {
    sinon.spy(console, 'log')
    const log = createLogger('foo', { console: true, level: 'error' })
    log.debug()
    log.info()
    log.warn()
    log.error()
    console.log.calledOnce.should.equal(true) // eslint-disable-line no-console
    console.log.restore() // eslint-disable-line no-console
  })

  it('can register and deregister new loggers', function () {
    const spy = sinon.spy()
    const log = createLogger('foo')
    const deregister = log.register((...args) => {
      args.should.deep.equal(['debug', 'foo'])
      spy()
    })
    log.debug('foo')
    deregister()
    spy.calledOnce.should.equal(true)
  })

  it('register throws if the arg is not a function', function () {
    const log = createLogger('foo');
    (() => log.register('foo')).should.throw('Expected')
  })
})
