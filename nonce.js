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

  compare: function(nonce) {
    return !!cache.get(nonce);
  }
};
