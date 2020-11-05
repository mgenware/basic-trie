# basic-trie

[![Build Status](https://github.com/mgenware/basic-trie/workflows/Build/badge.svg)](https://github.com/mgenware/basic-trie/actions)
[![npm version](https://img.shields.io/npm/v/basic-trie.svg?style=flat-square)](https://npmjs.com/package/basic-trie)
[![Node.js Version](http://img.shields.io/node/v/basic-trie.svg?style=flat-square)](https://nodejs.org/en/)

A tiny TypeScript trie implementation.

## Installation

```sh
yarn add basic-trie
```

## Usage

```ts
import Trie from 'basic-trie`;

// Create a new trie.
const trie = new Trie<number, string>();

trie.get([1, 2, 3]);
// undefined

trie.set([1, 2, 3], '123');

trie.get([1, 2, 3]);
// '123'

trie.get([1, 2]);
// null
// NOTE:
// Returns null instead of undefined as trie starts with
// [1, 2], but there's no value associated with [1, 2])

trie.get([1, 2, 3, 4]);
// undefined

trie.get([1]);
// null

trie.get([2, 1]);
// undefined
```
