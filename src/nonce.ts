import { LRUCache } from 'typescript-lru-cache';

export const cache = new LRUCache<string, string>({
  entryExpirationTimeInMS: 1000 * 60 * 60 * 24 // 1 day
});

const options = "abcdefghijklmnopqrstuwvxyzABCDEFGHIJKLMNOPQRSTUWVXYZ0123456789+/".split('');

export const generateRandomString = (length: number = 15): string => {
  let n = "";
  do {
    n += options[Math.floor(Math.random() * options.length)];
  } while (n.length < length);
  return n;
}


export type Props =
  number | {
    expires?: number,
    scope?: string | string[],
  }


export const generate = (props?: Props): string => {

  // exipiration
  let maxAge = -1;
  if (typeof props == 'number') {
    maxAge = props;
  } else if (props && props.expires) {
    maxAge = props.expires;
  }

  // scope
  let scope = '';
  if (props && typeof props !== "number" && props.scope) {
    if (!Array.isArray(props.scope)) { props.scope = [props.scope]; }
    scope = props.scope.join('');
  }

  // create nonce, set to cache
  let nonce = generateRandomString();
  if (maxAge != -1) {
    cache.set(nonce, scope, { entryExpirationTimeInMS: maxAge });
  } else {
    cache.set(nonce, scope);
  }
  return nonce;
}

export const peekCompare = (nonce: string | number, scope?: string | string[]): boolean => {
  let value = cache.get(nonce.toString());

  if (value == null) return false;

  if (value == '') return true

  if (!scope) return false;

  if (!Array.isArray(scope)) { scope = [scope]; }
  return value == scope.join('');
}

export const compare = (nonce: string | number, scope?: string | string[]): boolean => {
  nonce = nonce.toString();
  let valid = peekCompare(nonce, scope);
  if (valid) { cache.delete(nonce); }
  return valid;
}

export const remove = (nonce: string | number): string | false => {
  nonce = nonce.toString();
  let saved = cache.get(nonce);
  if (saved == null) return false;
  cache.delete(nonce);
  return nonce;
}

export default {
  generate,
  compare,
  peekCompare,
  remove
}