class Node<K, V> {
  // The underlying map of this node.
  map = new Map<K, Node<K, V>>();
  // The value associated with this entry.
  value: V | null = null;
}

export default class Trie<K, V> {
  #rootNode = new Node<K, V>();

  set(keys: K[], val: V) {
    let node = this.#rootNode;
    for (const key of keys) {
      const target = node.map.get(key);
      if (target) {
        node = target;
      } else {
        const newNode = new Node<K, V>();
        node.map.set(key, newNode);
        node = newNode;
      }
    }
    node.value = val;
  }

  get(keys: K[]): V | undefined | null {
    let node = this.#rootNode;
    for (const key of keys) {
      const target = node.map.get(key);
      if (target) {
        node = target;
      } else {
        return undefined;
      }
    }
    return node.value;
  }
}
