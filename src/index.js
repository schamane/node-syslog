import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

let exports

if (process.env.WASI_TEST) {
  exports = require('./index.wasi.cjs')
} else {
  exports = require('../node-syslog.node')
}

export default exports