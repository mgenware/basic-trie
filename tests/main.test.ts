/* eslint-disable class-methods-use-this */
import * as assert from 'assert';
import Trie, { PayloadType } from '..';

it('Main', () => {
  const trie = new Trie<number, string>();
  assert.strictEqual(trie.get([1, 2, 3]), undefined);

  trie.set([1, 2, 3], '123');
  assert.strictEqual(trie.get([1, 2, 3]), '123');
  assert.strictEqual(trie.get([1, 2]), null);
  assert.strictEqual(trie.get([1, 2, 3, 4]), undefined);
  assert.strictEqual(trie.get([1]), null);
  assert.strictEqual(trie.get([2, 1]), undefined);
});

class MyTrie extends Trie<string, string> {
  isKeyWildcard(key: string): boolean {
    return key.startsWith(':');
  }

  getWildcardPayload(
    key: string,
    wildcardName: string,
    _wildcardValue: string | null,
  ): PayloadType | undefined {
    return {
      [wildcardName.substr(1)]: key,
    };
  }
}

function splitPathString(s: string): string[] {
  return s.split('/');
}

function addMyPath(trie: MyTrie, s: string) {
  trie.set(splitPathString(s), s);
}

it('Wildcard: single wildcard', () => {
  const trie = new MyTrie();
  addMyPath(trie, ':s');
  assert.deepStrictEqual(trie.getWithPayload(['a']), [':s', { s: 'a' }]);
  assert.deepStrictEqual(trie.getWithPayload([':s']), [':s', { s: ':s' }]);
  assert.deepStrictEqual(trie.getWithPayload(['a', 'b']), [undefined, undefined]);
});

it('Wildcard: multiple wildcards', () => {
  const trie = new MyTrie();
  addMyPath(trie, ':a/:b');
  assert.deepStrictEqual(trie.getWithPayload(['1', '2']), [':a/:b', { a: '1', b: '2' }]);
  assert.deepStrictEqual(trie.getWithPayload(['1', '2', '3']), [undefined, undefined]);
  assert.deepStrictEqual(trie.getWithPayload(['1']), [null, { a: '1' }]);
});

it('Wildcard: same level and precedence', () => {
  const trie = new MyTrie();
  addMyPath(trie, ':a');
  addMyPath(trie, ':b');
  addMyPath(trie, ':c/:sub1');
  addMyPath(trie, 'imp/:sub2');
  assert.deepStrictEqual(trie.getWithPayload(['a']), [':a', { a: 'a' }]);
  assert.deepStrictEqual(trie.getWithPayload(['a', 'b', 'c']), [undefined, undefined]);
  assert.deepStrictEqual(trie.getWithPayload(['a', 'b']), [':c/:sub1', { c: 'a', sub1: 'b' }]);
  assert.deepStrictEqual(trie.getWithPayload(['imp', 'b']), ['imp/:sub2', { sub2: 'b' }]);
});
