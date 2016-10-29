import debug from 'debug'
import pkg from '../package.json'

const writeDebug = debug(pkg.name)

const levels = ['debug', 'info', 'warn', 'error', 'none']

function getLevelIndex (level) {
  const levelIndex = levels.indexOf(level)
  if (levelIndex === -1) {
    throw new Error(`Invalid level "${level}"`)
  }
  return levelIndex
}

export class Transport {
  constructor (options = {}) {
    this.level = options.level || 'info'
  }

  set level (level) {
    this.levelIndex = getLevelIndex(level)
  }

  get level () {
    return levels[this.levelIndex]
  }

  write () {
    throw new Error('Write method must be implemented')
  }

  conditionalWrite (logApi) {
    const { level } = logApi
    const passedLevelIndex = getLevelIndex(level)
    if (passedLevelIndex < this.levelIndex) return
    this.write(logApi)
  }

  inspect () {
    const { level, write } = this
    return { level, write }
  }
}

export class ConsoleTransport extends Transport {
  write ({ level, timestamp, args }) {
    console.log(`${timestamp} : ${level} |`, ...args) // eslint-disable-line no-console
  }
}

export class DebugTransport extends Transport {
  write () {
    writeDebug(arguments)
  }
}

export class Logger {
  constructor (namespace) {
    this.namespace = namespace || ''
    this.listeners = []
  }

  add (transport) {
    this.listeners.push(transport.conditionalWrite.bind(transport))
  }

  pipe (logger) {
    this.listeners.push(logger._emit.bind(logger))
  }

  _emit (logApi) {
    this.listeners.forEach(listener => listener(logApi))
  }

  _toLogApi (level, args) {
    const timestamp = new Date()
    const namespace = this
    this._emit({ namespace, level, timestamp, args })
  }

  debug (...args) {
    this._toLogApi('debug', args)
  }

  info (...args) {
    this._toLogApi('info', args)
  }

  warn (...args) {
    this._toLogApi('warn', args)
  }

  error (...args) {
    this._toLogApi('error', args)
  }

  inspect () {
    const { add, pipe, debug, warn, error, listeners } = this
    return { add, pipe, debug, warn, error, listeners }
  }
}
