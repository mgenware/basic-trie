/* eslint-disable class-methods-use-this */
export class Node<K, V> {
  // The underlying map of this node.
  map = new Map<K, Node<K, V>>();

  // The value associated with this entry.
  value: V | null = null;

  // A map containing all sub-routes for wildcards.
  wildcardMap?: Map<K, Node<K, V>>;
}

export type PayloadType = Record<string, unknown>;

enum ResultValue {
  notFound,
  partiallyFound,
  found,
}

export default class Trie<K, V> {
  #rootNode = new Node<K, V>();

  // Whether logging is enabled.
  logging = false;

  set(keys: K[], val: V): void {
    this.log(`Calling set with keys "${JSON.stringify(keys)}", val: "${JSON.stringify(val)}"`);
    this.checkKeys(keys);
    let node = this.#rootNode;
    for (const key of keys) {
      this.log(`Setting key "${key}"`);
      if (this.isKeyWildcard(key)) {
        if (!node.wildcardMap) {
          node.wildcardMap = new Map<K, Node<K, V>>();
        }
        this.log(`Setting wildcard at key "${key}"`);
        const newNode = new Node<K, V>();
        node.wildcardMap.set(key, newNode);
        node = newNode;
      } else {
        const target = node.map.get(key);
        if (target) {
          this.log('Target found');
          node = target;
        } else {
          this.log('Creating new node');
          const newNode = new Node<K, V>();
          node.map.set(key, newNode);
          node = newNode;
        }
      }
    }
    node.value = val;
  }

  getWithPayload(keys: K[]): [V | undefined | null, PayloadType | undefined] {
    this.log(`Calling getWithPayload with keys "${JSON.stringify(keys)}"`);
    this.checkKeys(keys);
    return this.getWithPayloadCore(this.#rootNode, keys, 0, undefined);
  }

  get(keys: K[]): V | undefined | null {
    const [result] = this.getWithPayload(keys);
    return result;
  }

  /**
   * Return values:
   * [
   *   1: the value associated with the given keys.
   *   2: the payload returned by `getWildcardPayload`.
   * ]
   */
  private getWithPayloadCore(
    node: Node<K, V>,
    keys: K[],
    index: number,
    inheritedPayload: Readonly<PayloadType> | undefined,
  ): [V | undefined | null, PayloadType | undefined] {
    // Exit condition.
    if (index >= keys.length) {
      this.log(`Found the value "${node.value}", payload ${JSON.stringify(inheritedPayload)}`);
      return [node.value, inheritedPayload];
    }

    const key = keys[index];
    if (!key) {
      throw new Error(`Unexpected undefined value at index ${index}`);
    }
    this.logWithKey(key, `Getting value with key "${key}"`);

    let firstAttemptResult: [V | undefined | null, PayloadType | undefined] = [
      undefined,
      undefined,
    ];
    const target = node.map.get(key);
    if (target) {
      this.logWithKey(key, 'Target found');
      firstAttemptResult = this.getWithPayloadCore(target, keys, index + 1, inheritedPayload);
    }

    this.logWithKey(
      key,
      `Checking first attempt result "${JSON.stringify(firstAttemptResult[0])}"`,
    );
    if (firstAttemptResult[0] !== undefined && firstAttemptResult[0] !== null) {
      this.logWithKey(key, `Found the value at first attempt "${firstAttemptResult[0]}"`);
      return firstAttemptResult;
    }

    // Nothing at first attempt.
    // Try wildcard match.
    const { wildcardMap } = node;
    if (wildcardMap) {
      let secondAttemptResult: [V | undefined | null, PayloadType | undefined] = [
        undefined,
        undefined,
      ];
      for (const [nodeKey, nodeValue] of wildcardMap.entries()) {
        this.logWithKey(key, `Keep searching with child entry "${nodeKey}" in wildcard mode`);

        const payload = {
          ...inheritedPayload,
          ...this.getWildcardPayload(key, nodeKey, nodeValue.value),
        };
        this.logWithKey(
          key,
          `Handling wildcard, key "${key}", value "${node.value}" payload ${JSON.stringify(
            payload,
          )}`,
        );
        const res = this.getWithPayloadCore(nodeValue, keys, index + 1, payload);
        const resValue = this.resultValue(res[0]);
        this.logWithKey(
          key,
          `Checking second attempt result "${JSON.stringify(secondAttemptResult[0])}"`,
        );
        if (resValue > this.resultValue(secondAttemptResult[0])) {
          secondAttemptResult = res;
          if (resValue >= ResultValue.found) {
            return res;
          }
        }
      }

      this.logWithKey(key, 'Nothing found in wildcard mode');
      // Nothing found, return second attempt result as it might be null
      // instead of undefined when keys are parts of a path.
      return secondAttemptResult;
    }
    this.logWithKey(key, 'Nothing found');
    return firstAttemptResult;
  }

  protected isKeyWildcard(_key: K): boolean {
    return false;
  }

  protected getWildcardPayload(
    _key: K,
    _wildcardName: K,
    _wildcardValue: V | null,
  ): PayloadType | undefined {
    return undefined;
  }

  private checkKeys(keys: K[]) {
    if (!keys?.length) {
      throw new Error(`Empty keys, got "${JSON.stringify(keys)}"`);
    }
  }

  private log(s: string) {
    if (this.logging) {
      // eslint-disable-next-line no-console
      console.log(s);
    }
  }

  private logWithKey(key: K, msg: string) {
    this.log(`KEY: ${key} | ${msg}`);
  }

  private resultValue(result: V | null | undefined): ResultValue {
    if (result === undefined) {
      return ResultValue.notFound;
    }
    if (result === null) {
      return ResultValue.partiallyFound;
    }
    return ResultValue.found;
  }
}
