import * as assert from 'assert';
import Trie from '..';

it('Main', () => {
  const trie = new Trie<number, string>();
  assert.strictEqual(trie.count, 0);
  assert.strictEqual(trie.get([1, 2, 3]), undefined);

  trie.set([1, 2, 3], '123');
  assert.strictEqual(trie.count, 1);
  assert.strictEqual(trie.get([1, 2, 3]), '123');
  assert.strictEqual(trie.get([1, 2]), null);
  assert.strictEqual(trie.get([1, 2, 3, 4]), undefined);
  assert.strictEqual(trie.get([1]), null);
  assert.strictEqual(trie.get([2, 1]), undefined);
});
