import debug from 'debug'

import { throwIfNotFunction } from '@carnesen/checks'

const levels = ['debug', 'info', 'warn', 'error', 'none']

function getLevelIndex (level) {
  const levelIndex = levels.indexOf(level)
  if (levelIndex === -1) {
    throw new Error(`Invalid level "${level}"`)
  }
  return levelIndex
}

export default function (name, options) {
  options = options || {}

  const _registeredLoggers = []
  let _levelIndex = getLevelIndex(options.level || 'info')

  function register (logger) {
    throwIfNotFunction(logger)
    _registeredLoggers.push(logger)
    let registered = true
    return function deregister () {
      if (!registered) {
        return
      }
      const index = _registeredLoggers.indexOf(logger)
      _registeredLoggers.splice(index, 1)
    }
  }

  function setLevel (level) {
    _levelIndex = getLevelIndex(level)
  }

  const debugLogger = debug(name)

  if (options.debug !== false) {
    register(debugLogger)
  }

  function consoleLogger (...args) {
    const levelIndex = getLevelIndex(args[0])
    if (levelIndex < _levelIndex) {
      return
    }
    console.log(...args.splice(1)) // eslint-disable-line no-console
  }

  if (options.console === true) {
    register(consoleLogger)
  }

  function _log (...args) {
    // freeze logger array to prevent funny behavior if one deregisters mid-log
    const currentRegisteredLoggers = [..._registeredLoggers]
    currentRegisteredLoggers.forEach(logger => logger(...args))
  }

  function log (...args) {
    _log('info', ...args)
  }
  log.consoleLogger = consoleLogger
  log.debugLogger = debugLogger
  log.register = register
  log.setLevel = setLevel
  levels.forEach(level => {
    log[level] = (...args) => _log(level, ...args)
  })

  return log
}
