const { describe, it } = require('mocha')
const nn = require('../dist/nonce')
const { expect } = require('chai')

describe('@legacy', () => {
  it('does not break with the legacy interface', () => {
    expect(nn.generate).to.be.a('function')
    expect(nn.compare).to.be.a('function')
    expect(nn.peekCompare).to.be.a('function')
    expect(nn.cache).not.to.equal(undefined)
  })

  it('works nicely when transpiled to JS', () => {
    const nonce = nn.generate()

    expect(nn.compare('hello')).not.to.equal(true, 'nonce does not exist')
    expect(nn.peekCompare(nonce)).to.equal(true, 'peeked and correctly validated')
    expect(nn.compare(nonce)).to.equal(true, 'correctly validated, not removed')
    expect(nn.compare(nonce)).not.to.equal(true, 'should only validate once')
  })
})
