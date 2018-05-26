let n = require('nonce')();
let LRU = require("lru-cache");


let cache = LRU({
  maxAge: 1000 * 60 * 60 * 24 // 1 day
});


module.exports = {
  cache: cache,

  generate: function() {
    let nonce = n();
    cache.set(nonce, true);
    return nonce;
  },

  peekCompare: function(nonce) {
    return !!cache.peek(nonce);
  },

  compare: function(nonce) {
    let valid = !!cache.get(nonce);
    if (valid) { cache.del(nonce); }
    return valid;
  },

  remove: function(nonce) {
    let valid = !!cache.get(nonce);
    if (!valid) { return false };
    cache.del(nonce);
    return nonce;
  }
};
