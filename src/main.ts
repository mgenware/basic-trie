class Node<K, V> {
  map = new Map<K, Node<K, V>>();
  value: V | null = null;
}

export default class Trie<K, V> {
  #rootNode = new Node<K, V>();

  get count(): number {
    return this.#rootNode.map.size;
  }

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
