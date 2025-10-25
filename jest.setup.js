import '@testing-library/jest-dom'

// Mock WebCrypto API for Node.js environment
const { webcrypto } = require('crypto')
const { TextEncoder, TextDecoder } = require('util')

// Set up crypto API - assign the webcrypto object directly to preserve all properties
Object.defineProperty(global, 'crypto', {
  value: webcrypto,
  writable: false,
  configurable: true
})

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder
}
