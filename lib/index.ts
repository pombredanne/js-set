export interface Set<V> extends Array<V> {
    isSet: void;
}

type EntryCallback<V, C> = (valueA: V, valueB: V, context: C) => boolean | void;

type SetCallback<V, C> = (set: Set<V>, index: number, context: C) => boolean;

function copy<V>(set: Set<V>, index: number, result: Set<V>): boolean {
    for (const len = set.length; index < len; index++) {
        result.push(set[index]);
    }
    return true;
}

function alwaysTrue() {
    return true;
}

function isComplete<V>(set: Set<V>, index: number): boolean {
    return set.length === index;
}

function iter<V, C>(setA: Set<V>, setB: Set<V>, callback: EntryCallback<V, C>, setACallback: SetCallback<V, C>, setBCallback: SetCallback<V, C>, context?: C): boolean {
    const lenA = setA.length;
    const lenB = setB.length;
    let indexA = 0;
    let indexB = 0;
    while (indexA < lenA && indexB < lenB) {
        const valueA = setA[indexA];
        const valueB = setB[indexB];
        if (valueA <= valueB) {
            indexA++;
        }
        if (valueB <= valueA) {
            indexB++;
        }
        if (callback(valueA, valueB, context) === false) {
            return false;
        }
    }
    return setACallback(setA, indexA, context) && setBCallback(setB, indexB, context);
}

function merge<V>(setA: Set<V>, setB: Set<V>, callback: EntryCallback<V, Set<V>>, setACallback: SetCallback<V, Set<V>>, setBCallback: SetCallback<V, Set<V>>): Set<V> {
    const result = [] as Set<V>;
    iter(setA, setB, callback, setACallback, setBCallback, result);
    return result;
}


// set API.

export function add<V>(set: Set<V>, key: V): Set<V> {
    let len = set.length;
    const result = [] as Set<V>;
    let index: number = 0;
    for (; index < len; index++) {
        if (set[index] === key) {
            return set;
        } else if (set[index] > key) {
            result.push(key);
            break;
        }
        result.push(set[index]);
    }
    if (index === len) {
        result.push(key);
    } else {
        copy(set, index, result);
    }
    return result;
}

export function create<V>(): Set<V> {
    return [] as Set<V>;
}

function differenceCallback<V>(valueA: V, valueB: V, result: Set<V>): void {
    if (valueA < valueB) {
        result.push(valueA);
    }
}

export function difference<V>(setA: Set<V>, setB: Set<V>): Set<V> {
    return merge(setA, setB, differenceCallback, copy, alwaysTrue);
}

export function from<V>(keys: Array<V>): Set<V> {
    const len = keys.length;
    if (len <= 1) {
        return keys as Set<V>;
    }
    const sortedKeys = keys.slice();
    sortedKeys.sort();
    const result = [sortedKeys[0]] as Set<V>;
    for (let index = 1; index < len; index++) {
        if (sortedKeys[index] !== sortedKeys[index - 1]) {
            result.push(sortedKeys[index]);
        }
    }
    return result;
}

export function has<V>(set: Set<V>, key: V): boolean {
    const len = set.length;
    if (len === 0) {
        return false;
    }
    let index: number;
    let newIndex = Math.floor(len / 2);
    while (index !== newIndex) {
        index = newIndex;
        if (set[index] === key) {
            return true;
        } else if (set[index] > key) {
            newIndex = index / 2;
        } else {
            newIndex = (index + len) / 2;
        }
        newIndex = Math.floor(newIndex);
    }
    return false;
}

function intersectionCallback<V>(valueA: V, valueB: V, result: Set<V>): void {
    if (valueA === valueB) {
        result.push(valueA);
    }
}

export function intersection<V>(setA: Set<V>, setB: Set<V>): Set<V> {
    return merge(setA, setB, intersectionCallback, alwaysTrue, alwaysTrue);
}

function isDisjointCallback<V>(valueA: V, valueB: V): boolean {
    return valueA !== valueB;
}

export function isDisjoint<V>(setA: Set<V>, setB: Set<V>): boolean {
    return iter(setA, setB, isDisjointCallback, alwaysTrue, alwaysTrue);
}

function isSubsetCallback<V>(valueA: V, valueB: V): boolean {
    return valueA >= valueB;
}

export function isSubset<V>(setA: Set<V>, setB: Set<V>): boolean {
    return iter(setA, setB, isSubsetCallback, isComplete, alwaysTrue);
}

export function isSuperset<V>(setA: Set<V>, setB: Set<V>): boolean {
    return isSubset(setB, setA);
}

export function remove<V>(set: Set<V>, key: V): Set<V> {
    let len = set.length;
    const result = [] as Set<V>;
    let index: number = 0;
    for (; index < len; index++) {
        if (set[index] === key) {
            copy(set, index + 1, result);
            return result;
        }
        result.push(set[index]);
    }
    // Return the original set for value equality.
    return set;
}

function symmetricDifferenceCallback<V>(valueA: V, valueB: V, result: Set<V>): void {
    if (valueA < valueB) {
        result.push(valueA);
    } else if (valueB < valueA) {
        result.push(valueB);
    }
}

export function symmetricDifference<V>(setA: Set<V>, setB: Set<V>): Set<V> {
    return merge(setA, setB, symmetricDifferenceCallback, copy, copy);
}

function unionCallback<V>(valueA: V, valueB: V, result: Set<V>): void {
    if (valueA <= valueB) {
        result.push(valueA);
    } else if (valueB < valueA) {
        result.push(valueB);
    }
}

export function union<V>(setA: Set<V>, setB: Set<V>): Set<V> {
    return merge(setA, setB, unionCallback, copy, copy);
}
