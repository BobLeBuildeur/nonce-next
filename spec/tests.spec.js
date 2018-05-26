
let nonce = require('../nonce');

describe('Nonce-next', () => {

  // afterEach(() => {
  //   nonce.cache.reset();
  // });

  it ('should generate nonces when requested', () => {
    let nonce1 = nonce2 = undefined;

    nonce1 = nonce.generate();
    nonce2 = nonce.generate();

    expect(nonce1).toBeDefined();
    expect(nonce2).toBeDefined();

    expect(nonce1).toMatch(/\d{15}/);
    expect(nonce2).toMatch(/\d{15}/);

    expect(nonce1).not.toEqual(nonce2);
  });

  it ('should persist nonces to memory, to be avaiable between sessions', () => {
    expect(nonce.cache).toBeDefined();

    let n = nonce.generate();

    expect(nonce.cache.get(n)).toBeDefined();
  });

  // it ('should compare nonces', () => {});

  // it ('should remove nonces once compared', () => {});

  // it ('should be able to remove nonces', () => {});

  // it ('should be able to peek at nonces without removing them', () => {});

  // it ('should set an expiration date for nonces', () => {});

  // it ('should invalidade expried nonces', () => {});


});