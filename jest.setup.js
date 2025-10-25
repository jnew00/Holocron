import '@testing-library/jest-dom'

// Mock WebCrypto API for Node.js environment
const { webcrypto } = require('crypto')
const { TextEncoder, TextDecoder } = require('util')

// Set up crypto API
if (!global.crypto) {
  global.crypto = {
    subtle: webcrypto.subtle,
    getRandomValues: webcrypto.getRandomValues.bind(webcrypto)
  }
}

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder
}
