let n = require('nonce')();

module.exports = {
  generate: function() {
    return n();
  }
};
