
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./fixtures.cjs.production.min.js')
} else {
  module.exports = require('./fixtures.cjs.development.js')
}
