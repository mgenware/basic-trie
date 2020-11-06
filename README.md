# basic-trie

[![Build Status](https://github.com/mgenware/basic-trie/workflows/Build/badge.svg)](https://github.com/mgenware/basic-trie/actions)
[![npm version](https://img.shields.io/npm/v/basic-trie.svg?style=flat-square)](https://npmjs.com/package/basic-trie)
[![Node.js Version](http://img.shields.io/node/v/basic-trie.svg?style=flat-square)](https://nodejs.org/en/)

A tiny TypeScript trie implementation with limited wildcards support.

## Installation

```sh
yarn add basic-trie
```

## Usage

```ts
import Trie from 'basic-trie';

// Create a new trie.
const trie = new Trie<number, string>();

trie.get([1, 2, 3]);
// undefined

// Set a value.
trie.set([1, 2, 3], '123');

trie.get([1, 2, 3]);
// '123'

trie.get([1, 2]);
// null
// NOTE:
// Returns null instead of undefined as trie starts with
// [1, 2], but there's no value associated with [1, 2].

trie.get([1, 2, 3, 4]);
// undefined

trie.get([1]);
// null

trie.get([2, 1]);
// undefined
```

### Wildcards support

Wildcards are supported by overriding a few methods of `Trie` class, example:

```ts
import Trie from 'basic-trie';

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

// Helper funcs to demonstrate uses of wildcards.
function splitPathString(s: string): string[] {
  return s.split('/');
}

function addMyPath(trie: MyTrie, s: string) {
  trie.set(splitPathString(s), s);
}

const trie = new MyTrie();
addMyPath(trie, ':a');
addMyPath(trie, ':b');
addMyPath(trie, ':c/:sub1');
addMyPath(trie, 'imp/:sub2');
trie.getWithPayload(['a']);
// ['a'] matches wildcard ':a'
// Prints [':a', { a: 'a' }]

trie.getWithPayload(['a', 'b', 'c']);
// No match
// Prints [undefined, undefined]

trie.getWithPayload(['a', 'b']);
// ['a', 'b'] matches two consecutive wildcards ':c/:sub1'.
// Prints [':c/:sub1', { c: 'a', sub1: 'b' }]

trie.getWithPayload(['imp', 'b']);
// ['imp', 'b'] actually matches both ':c/:sub1' and 'imp/:sub2',
// but 'imp/:sub2' takes precedence as 'imp' is not a wildcard.
// Prints ['imp/:sub2', { sub2: 'b' }]
```
