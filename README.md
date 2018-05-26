# _nn_: Nonce-Next

Real Nonce (Number used only once) for node.

## Getting Started

Easy breezy:

```javascript
let nn = require('nonce-next');

// Generate a nonce
let nonce = nn.generate();
console.log(nonce); // Something like 123456789123

// Validate
console.log(nn.compare(nonce)); // True!

// Only once!
console.log(nn.compare(nonce)); // False!!!
```

### How it works... And what for?

_nn_ generates a different number every time it is called, based on your
timestamp and an increasing counter.

Nonces get saved to a LRU memory store, to avoid memory leaks,
and to expire automagically.

When checked, _nn_ invalidates the last nonce, to make sure it is used only once.

Because that's the whole point!

Use for securing websites forms, like so:

`routes/post-message.js`

````javascript
route.get('/form', (req, res, next) => {
  res.render('form', {
    nonce: nn.generate()
  });
});

route.post('/add', (req, res, next) => {
  if (!req.body.nonce || !req.body.message) {
    // missing params
    res.send('Fail! - missing params');
  }

  // compare nonce
  if(!nn.compare(req.body.nonce)) {
    // OOPS, not valid!
    res.send('Fail! - Invalid nonce');
  }

  res.send('OK! - Nonce is valid and message is: ', req.body.message);
});

````

`views/form.ejs`

```ejs
<form action="/add" method="post">
  <input type="hidden" name="nonce" value="<%= nonce %>">
  <input type="text" name="message">
  <input type="submit">
</form>
```



### Docs

* `nonce.generate([maxAge=1000*60*60*24])`

   Generates and saves persists a nonce to LRU memory store

   Optionally, set the expiration time which defaults to 1 day

* `nonce.compare(nonce)`

   Compares nonce, removing it from the store never to be used again!

* `nonce.peekCompare(nonce)`

   Compares nonce without removing it from database.

* `nonce.remove(nonce)`

   Removes nonce from the store.

   Returns the removed nonce

* `nonce.cache`

   The LRU cache object, to bet down, dirty and low level
