# _nn_: Nonce-Next

~~Real~~ Super Awesome Nonce (**n**umber used only **once**) for node.

🤘 Now in typescript! 🤘

## Table of Contents

1. [Getting started](#install)
1. [New and improved](#new-and-improved)
1. [How it works](#how-it-works-and-what-for)
1. Docs:
    1. [API](#api)
    1. [Joi validator](#joi-validator)
    1. [Testing](#testing)

## Getting started

### Install


```javascript
npm install --save nonce-next
```

### Import



```typescript
  import nn from 'nonce-next';

  // alternatively import individual features
  import { generate, compare } from 'nonce-next';
```

or

```javascript
  let nn = require('nonce-next');
```

### Go nuts!

```javascript

// Generate a nonce
let nonce = nn.generate();

console.log(nonce); // Something like aTk49cE44jsGP

// Validate
console.log(nn.compare(nonce)); // True!

// Only once!
console.log(nn.compare(nonce)); // False!!!
```

## New and improved

Version 1.2.0 moved to Typescript and includes a few creature conforts.

💪 All the new goodies:

* **Typescript!** Types and everything
* **Joi integration** Built-in validation for Joi. [See how easy it is.](#joi-validator)

💄 Some sexy improvements:

* **NEARLY** backwards compatible. [See the only gotcha.](#nncache)
* **More entropy** Moved from digits to base69, drastically reducing the chances of clashing nonces
* **Reduced dependencies** Less npm installs to carry around 

🐞 And pesky bug fixes:

* `compare` actually checks scopes as its meant to.

## How it works... And what for?

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

  /* ----------------------- */

  // or, if you are using joi
  // after importing the custom validator

  const schema = Joi.object({
    nonce: Joi.custom(nonceValidator)
  });

  const { value, error } = Joi.validate(req.body);

  if (error) res.send("Oops!");
  
  /* ----------------------- */

  res.send('OK! - Nonce is valid and message is: ', req.body.message);
});
````

`views/form.ejs`

```html
<form action="/add" method="post">
  <input type="hidden" name="nonce" value="<%= nonce %>">
  <input type="text" name="message">
  <input type="submit">
</form>
```

### Scoped nonces

Scoped nonces are a way to add an extra layer of security and organize your code

You can give your nonces one or more scopes, all of which must be present when compared:

```javascript
let n = nn.generate({
  scope: 'A scope!'
});

nn.peekCompare(n);              // False!
nn.peekCompare(n, 'A scope!');  // True!
```

## Docs

### API

#### `nn.generate(props?: number = 1000*60*60*24 | { expires?: number, scope?: string | string[] }): string`

Generates and saves persists a nonce to LRU memory store. Returns the nonce for future validation.

Can optionally receive a props object, or number specifying max age:

A number will set the nonce expiration in milliseconds.

The props object may contain any of the following properties:

* `expires: number`

  Expiration, does the same as passing a number directly

* `scope: string | string[]`

  A string or array of strings which will scope the nonce

Examples:

```javascript
nn.generate(60000);  	// will expire in a minute

nn.generate({
 expires: 60000,    	// expires in a minute
 scope: 'api'       	// scoped to 'api'
});

nn.generate({
 scope: ['api', 'file'] // scoped to 'api' and 'file'
});
```

#### `nn.compare(nonce: string, scope: string | string[]): boolean`

Compares nonce, removing it from the store never to be used again!

May pass optional string of array of strings to check scope. Scope must match all strings.

Example:

```javascript
const nonce1 = nn.generate();

nn.compare(nonce1); // True
nn.compare(nonce1); // False, already used

const nonce2 = nn.generate({ scope: 'transaction' });

nn.compare(nonce2);					// False
nn.compare(nonce2, 'transaction'); 	// True


const nonce3 = nn.generate({ scope: ['transaction', 'payment'] });

nn.compare(nonce3);								// False
nn.compare(nonce3, 'transaction'); 				// False
nn.compare(nonce3, ['transaction', 'payment']);	// True
```

#### `nn.peekCompare(nonce: string, scope?: string | string[]): boolean`

Compares nonce without removing it from database.

May pass optional string or array of strings to check scope. Scope must match all strings.

**Note: this should probably not be used, since the idea of a nonce is being invalidated!**

See [nn.compare](#nncomparenonce-string-scope-string--string-boolean) for example

```javascript
const nonce = nn.generate();

nn.peekCompare(nonce); // True
nn.peekCompare(nonce); // Still true! Does not remove 
```

#### `nn.remove(nonce: string): string | false`

Removes nonce from the store.

Returns the removed nonce key

#### `generateRandomString(length: number=15): string`

Generates a random string with `length` letters and numbers (base64 compliant).

Available through the `nn` namespace for CommonJS modules.

#### `cache: LRUCache`

The LRU cache object, to get down, dirty and low level

Available through the `nn` namespace for CommonJS modules.

*NOTE: Version 1.2.0 updates this dependency. If you accessed accessed this property directly, be warry the changes are breaking.*

### Joi validator

Nonce-next comes with a joi validator, to make life a bit easier.

It needs to be imported separately

```typescript
  import nonceValidator from 'nonce-next/joi';
  // or
  const nonceValidator = require('nonce-next/joi');
```

And can de used as a custom validator

```typescript
const n = nn.generate();

const schema = Joi.custom(nonceValidator);

const { value } = schema.validate(nn); // Hokey-dokey!

const { error } = scehma.validate(nn); // Not valid! (already used)
```

Note: joi validator does not offer custom messages

### Testing

There are a few tesing options

* `npm run test` tests all the current versions features
* `npm run test:legacy` tests backwards compatibility; Needs to be built before testing
* `npm run test:full` runs all tests; Needs to be built before testing
