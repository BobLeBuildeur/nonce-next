import { expect } from "chai";
import nonce, { cache, generateRandomString } from "./nonce";



describe('Nonce-next', () => {

  describe("Base", () => {
    it("has a predictable interface", () => {
      expect(nonce.generate).to.be.a('function');
      expect(nonce.compare).to.be.a('function');
      expect(nonce.peekCompare).to.be.a('function');
      expect(nonce.remove).to.be.a('function');
    });
    
    it("generates random numbers with multiple lengths", () => {
      const lengths = [1, 2, 5, 10, 15, 20, 50, 200];
      const strings = Array.from({ length: lengths.length }, (_v, i) => generateRandomString(lengths[i]));

      strings.forEach((str, i) => {
        const l = lengths[i]
        expect(str).to.be.a('string', `${i} is a string`);
        expect(str).to.have.length(l, `${i} has ${l} digits`);
        expect(strings.filter(n => strings.indexOf(n) == i).length == 1, `${i} is unique`);
      });
    });
  });

  describe("Nonce next", () => {

    it('should generate nonces when requested', () => {
      let nonce1 = nonce.generate();
      let nonce2 = nonce.generate();

      expect(nonce1).not.to.be.undefined;
      expect(nonce2).not.to.be.undefined;

      expect(nonce1).to.match(/[a-zA-Z0-9+\/=]{15}/);
      expect(nonce2).to.match(/[a-zA-Z0-9+\/=]{15}/);

      expect(nonce1).not.to.equal(nonce2);
    });

    it('should persist nonces to memory, to be avaiable between sessions', () => {
      expect(cache).not.to.be.undefined;

      let n = nonce.generate();

      expect(cache.get(n)).not.to.be.undefined;
    });

    it('should compare nonces', () => {
      let n = nonce.generate();
      let notn = 111111111111;

      expect(nonce.compare(n)).to.equal(true);
      expect(nonce.compare(notn)).to.equal(false);
    });

    it('@deprecated should work with strings as well as numbers', () => {
      let n = nonce.generate();
      let sn = '' + n;

      expect(nonce.compare(sn)).to.equal(true);
    });

    it('should remove nonces once compared', () => {
      let n = nonce.generate();

      expect(nonce.compare(n)).to.equal(true);
      expect(nonce.compare(n)).to.equal(false, 'should remove nonce after first comparison');
    });

    it('should be able to remove nonces, returning them', () => {
      let n1 = nonce.generate();

      let n2 = nonce.remove(n1);

      expect(n1).to.equal(n2, 'removed nonce should be equal')
      expect(nonce.compare(n1)).to.equal(false, 'nonce should be removed');
    });

    it('should return false when removing something that does not exist', () => {
      expect(nonce.remove(111111111111)).to.equal(false);
    });

    it('should be able to peek at nonces without removing them', () => {
      let n = nonce.generate();

      expect(nonce.peekCompare(n)).to.equal(true);
      expect(nonce.compare(n)).to.equal(true, 'should be true since peek does not remove nonce');
    });

    it('should set an expiration date for nonces, invalidade expired', done => {
      let n = nonce.generate(500); // expires after 500ms

      expect(nonce.peekCompare(n)).to.equal(true);

      setTimeout(() => {
        expect(nonce.peekCompare(n)).to.equal(false);

        done();
      }, 750);
    });

    it('should set an expiration from a properties object as well as a number', done => {
      let n = nonce.generate({
        expires: 500
      });

      expect(nonce.peekCompare(n)).to.equal(true);

      setTimeout(() => {
        expect(nonce.peekCompare(n)).to.equal(false);

        done();
      }, 750);
    })

    it('should be able to be scoped with one or move values', () => {
      let n1 = nonce.generate({
        scope: 'a'
      });

      let n2 = nonce.generate({
        scope: ['a', 'b']
      });

      // fail with no scope
      expect(nonce.peekCompare(n1)).to.equal(false, 'No scope, expecting a');
      expect(nonce.peekCompare(n2)).to.equal(false, 'No scope, expecting [a, b]');

      // fail with wrong scope
      expect(nonce.peekCompare(n1, 'b')).to.equal(false, 'Wrong scope, expecting a, supplied b');
      expect(nonce.peekCompare(n2, 'a')).to.equal(false, 'Missing scope, expecting [a, b], supplied a');

      // succeed
      expect(nonce.peekCompare(n1, 'a')).to.equal(true, "supplied correct scope (a)");
      expect(nonce.peekCompare(n2, ['a', 'b'])).to.equal(true, "supplied correct scope ([a, b])");
    });

    it('should compare scopes when appropriate', () => {
      let n = nonce.generate({
        scope: ['a', 'b']
      });

      // fail with no scope
      expect(nonce.compare(n)).to.equal(false, 'no scopes');
      expect(nonce.compare(n, ['a', 'b'])).to.equal(true, 'with scopes');
      expect(nonce.compare(n, ['a', 'b'])).to.equal(false, "should be removed");
    });
  });
});