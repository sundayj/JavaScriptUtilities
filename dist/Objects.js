"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walkThrough = exports.unflattenObject = exports.transform = exports.toPairs = exports.stringifyCircularJSON = exports.queryStringToObject = exports.groupBy = exports.countBy = exports.compactObject = exports.CSVToJSON = exports.renameKeys = exports.JSONtoCSV = exports.deepMerge = exports.get = void 0;
/**
 * Retrieves a set of properties indicated by the given selectors from an object.
 *
 * Use Array.prototype.map() for each selector, String.prototype.replace() to replace square brackets with dots.
 * Use String.prototype.split() to split each selector.
 * Use Array.prototype.filter() to remove empty values and Array.prototype.reduce() to get the value indicated by each selector.
 * @param from - The object you would like to select values from
 * @param selectors - Can use object notation, key access, or both
 * @returns {*[]}
 * @example
 * const obj = {
 *   selector: { to: { val: 'val to select' } },
 *   target: [1, 2, { a: 'test' }],
 * };
 * get(obj, 'selector.to.val', 'target[0]', 'target[2].a');
 * // ['val to select', 1, 'test']
 */
const get = (from, ...selectors) => [...selectors].map(s => s
    .replace(/\[([^\[\]]*)\]/g, '.$1.')
    .split('.')
    .filter(t => t !== '')
    .reduce((prev, cur) => prev && prev[cur], from));
exports.get = get;
/**
 * Deeply merges two objects, using a function to handle keys present in both.
 *
 * Use Object.keys() to get the keys of both objects, create a Set from them and use the spread operator (...) to create an array of all the unique keys.
 * Use Array.prototype.reduce() to add each unique key to the object, using fn to combine the values of the two given objects.
 * @param a - Object1
 * @param b - Object2
 * @param fn - A function that you define that tells deepMerge what to do with a key if that key exists in both objects.
 * @returns {*}
 * @example
 * deepMerge(
 *   { a: true, b: { c: [1, 2, 3] } },
 *   { a: false, b: { d: [1, 2, 3] } },
 *   (key, a, b) => (key === 'a' ? a && b : Object.assign({}, a, b))
 * );
 * // { a: false, b: { c: [ 1, 2, 3 ], d: [ 1, 2, 3 ] } }
 */
const deepMerge = (a, b, fn) => [...new Set([...Object.keys(a), ...Object.keys(b)])].reduce((acc, key) => ({ ...acc, [key]: fn(key, a[key], b[key]) }), {});
exports.deepMerge = deepMerge;
/**
 * Converts an array of objects to a comma-separated values (CSV) string that contains only the columns specified.
 *
 * Use Array.prototype.join() to combine all the names in columns to create the first row, using the provided delimiter.
 * Use Array.prototype.map() and Array.prototype.reduce() to create a row for each object. Substitute non-existent values with empty strings and only mapping values in columns.
 * Use Array.prototype.join() to combine all rows into a string, separating each row with a newline (\n).
 * Omit the third argument, delimiter, to use a default delimiter of ','.
 * @param arr - An array of objects. Any keys present in an object that doesn't have a corresponding value in the "columns" parameter will be omitted from the resulting SCV string.
 * @param columns - An array of columns. The strings listed here should match keys from the provided objects.
 * @param [delimiter] - Optional. Defaults to ",". Supply this argument if you'd like a different delimiter, such as ";", "\t", etc.
 * @returns {string}
 * @constructor
 * @example
 * JSONtoCSV(
 *   [{ a: 1, b: 2 }, { a: 3, b: 4, c: 5 }, { a: 6 }, { b: 7 }],
 *   ['a', 'b']
 * );
 * // 'a,b\n"1","2"\n"3","4"\n"6",""\n"","7"'
 *
 * JSONtoCSV(
 *   [{ a: 1, b: 2 }, { a: 3, b: 4, c: 5 }, { a: 6 }, { b: 7 }],
 *   ['a', 'b'],
 *   ';'
 * );
 * // 'a;b\n"1";"2"\n"3";"4"\n"6";""\n"";"7"'
 */
const JSONtoCSV = (arr, columns, delimiter = ',') => [
    columns.join(delimiter),
    ...arr.map(obj => columns.reduce((acc, key) => `${acc}${!acc.length ? '' : delimiter}"${!obj[key] ? '' : obj[key]}"`, '')),
].join('\n');
exports.JSONtoCSV = JSONtoCSV;
/**
 * Replaces the names of multiple object keys with the values provided.
 *
 * Use Object.keys() in combination with Array.prototype.reduce() and the spread operator (...) to get the object's keys and rename them according to keysMap.
 * @param keysMap - A key value object where the key matches a key in the object provided, and the value is the new name desired for the specified kep.
 * @param obj - The object for which you would like keys renamed.
 * @example
 * const obj = { name: 'Bobo', job: 'Front-End Master', shoeSize: 100 };
 * renameKeys({ name: 'firstName', job: 'passion' }, obj);
 * // { firstName: 'Bobo', passion: 'Front-End Master', shoeSize: 100 }
 */
const renameKeys = (keysMap, obj) => Object.keys(obj).reduce((acc, key) => ({
    ...acc,
    ...{ [keysMap[key] || key]: obj[key] }
}), {});
exports.renameKeys = renameKeys;
/**
 * Converts a comma-separated values (CSV) string to a 2D array of objects. The first row of the string is used as the title row.
 *
 * Use Array.prototype.indexOf() to find the first newline character (\n).
 * Use Array.prototype.slice() to remove the first row (title row) and String.prototype.split() to separate it into values, using the provided delimiter.
 * Use String.prototype.split() to create a string for each row.
 * Use String.prototype.split() to separate the values in each row, using the provided delimiter.
 * Use Array.prototype.reduce() to create an object for each row's values, with the keys parsed from the title row.
 * Omit the second argument, delimiter, to use a default delimiter of ",".
 * @param data - CSV data as a string
 * @param [delimiter] - Optional. Defaults to ",". Tells the function what delimiter to expect in the provided csv input.
 * @constructor
 * @example
 * CSVToJSON('col1,col2\na,b\nc,d');
 * // [{'col1': 'a', 'col2': 'b'}, {'col1': 'c', 'col2': 'd'}];
 *
 * CSVToJSON('col1;col2\na;b\nc;d', ';');
 * // [{'col1': 'a', 'col2': 'b'}, {'col1': 'c', 'col2': 'd'}];
 */
const CSVToJSON = (data, delimiter = ',') => {
    const titles = data.slice(0, data.indexOf('\n')).split(delimiter);
    return data
        .slice(data.indexOf('\n') + 1)
        .split('\n')
        .map(v => {
        const values = v.split(delimiter);
        return titles.reduce((obj, title, index) => ((obj[title] = values[index]), obj), {});
    });
};
exports.CSVToJSON = CSVToJSON;
/**
 * Deeply removes all falsy values from an object or array.
 *
 * Use recursion.
 * Initialize the iterable data, using Array.isArray(), Array.prototype.filter() and Boolean for arrays in order to avoid sparse arrays.
 * Use Object.keys() and Array.prototype.reduce() to iterate over each key with an appropriate initial value.
 * Use Boolean to determine the truthiness of each key's value and add it to the accumulator if it's truthy.
 * Use typeof to determine if a given value is an object and call the function again to deeply compact it.
 * @param val - The object to compact
 * @example
 * const obj = {
 *   a: null,
 *   b: false,
 *   c: true,
 *   d: 0,
 *   e: 1,
 *   f: '',
 *   g: 'a',
 *   h: [null, false, '', true, 1, 'a'],
 *   i: { j: 0, k: false, l: 'a' }
 * };
 * compactObject(obj);
 * // { c: true, e: 1, g: 'a', h: [ true, 1, 'a' ], i: { l: 'a' } }
 */
const compactObject = val => {
    const data = Array.isArray(val) ? val.filter(Boolean) : val;
    return Object.keys(data).reduce((acc, key) => {
        const value = data[key];
        if (Boolean(value))
            acc[key] = typeof value === 'object' ? (0, exports.compactObject)(value) : value;
        return acc;
    }, Array.isArray(val) ? [] : {});
};
exports.compactObject = compactObject;
/**
 * Groups the elements of an array based on the given function and returns the count of elements in each group.
 *
 * Use Array.prototype.map() to map the values of an array to a function or property name.
 * Use Array.prototype.reduce() to create an object, where the keys are produced from the mapped results.
 * @param arr - An array for which you would like a group count specified by the "fn" parameter.
 * @param fn - A function or other method by which to specify how you would like the count grouped.
 * @example
 * countBy([6.1, 4.2, 6.3], Math.floor);
 * // {4: 1, 6: 2}
 *
 * countBy(['one', 'two', 'three'], 'length');
 * // {3: 2, 5: 1}
 *
 * countBy([{ count: 5 }, { count: 10 }, { count: 5 }], x => x.count)
 * // {5: 2, 10: 1}
 */
const countBy = (arr, fn) => arr.map(typeof fn === 'function' ? fn : val => val[fn]).reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
}, {});
exports.countBy = countBy;
/**
 * Groups the elements of an array based on the given function.
 *
 * Use Array.prototype.map() to map the values of the array to a function or property name.
 * Use Array.prototype.reduce() to create an object, where the keys are produced from the mapped results.
 * @param arr - An array for which you would like the items grouped according to the specified "fn" parameter.
 * @param fn - A function or other method by which to specify how you would like the items grouped.
 * @example
 * groupBy([6.1, 4.2, 6.3], Math.floor);
 * // {4: [4.2], 6: [6.1, 6.3]}
 *
 * groupBy(['one', 'two', 'three'], 'length');
 * // {3: ['one', 'two'], 5: ['three']}
 */
const groupBy = (arr, fn) => arr
    .map(typeof fn === 'function' ? fn : val => val[fn])
    .reduce((acc, val, i) => {
    acc[val] = (acc[val] || []).concat(arr[i]);
    return acc;
}, {});
exports.groupBy = groupBy;
/**
 * Generates an object from the given query string or URL.
 *
 * Use String.prototype.split() to get the params from the given url.
 * Use the URLSearchParams constructor to create an appropriate object and convert it to an array of key-value pairs using the spread operator (...).
 * Use Array.prototype.reduce() to convert the array of key-value pairs into an object.
 * @param url
 * @example
 * queryStringToObject('https://google.com?page=1&count=10');
 * // {page: '1', count: '10'}
 */
const queryStringToObject = url => [...(new URLSearchParams(url.split('?')[1])).entries()].reduce((a, [k, v]) => ((a[k] = v), a), {});
exports.queryStringToObject = queryStringToObject;
/**
 * Serializes a JSON object containing circular references into a JSON format.
 *
 * Create a WeakSet to store and check seen values, using WeakSet.prototype.add() and WeakSet.prototype.has().
 * Use JSON.stringify() with a custom replacer function that omits values already in seen, adding new values as necessary.
 * ⚠️ NOTICE: This function finds and removes circular references, which causes circular data loss in the serialized JSON.
 * @param obj
 * @example
 * const obj = { n: 42 };
 * obj.obj = obj;
 * stringifyCircularJSON(obj);
 * // '{"n":42}'
 */
const stringifyCircularJSON = obj => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (k, v) => {
        if (v !== null && typeof v === 'object') {
            if (seen.has(v))
                return;
            seen.add(v);
        }
        return v;
    });
};
exports.stringifyCircularJSON = stringifyCircularJSON;
/**
 * Creates an array of key-value pair arrays from an object or other iterable.
 *
 * Check if Symbol.iterator is defined and, if so, use Array.prototype.entries() to get an iterator for the given iterable.
 * Use Array.from() to convert the result to an array of key-value pair arrays.
 * If Symbol.iterator is not defined for obj, use Object.entries() instead.
 * @param obj
 * @example
 * toPairs({ a: 1, b: 2 });
 * // [['a', 1], ['b', 2]]
 *
 * toPairs([2, 4, 8]);
 * // [[0, 2], [1, 4], [2, 8]]
 *
 * toPairs('shy');
 * // [['0', 's'], ['1', 'h'], ['2', 'y']]
 *
 * toPairs(new Set(['a', 'b', 'c', 'a']));
 * // [['a', 'a'], ['b', 'b'], ['c', 'c']]
 */
const toPairs = obj => obj[Symbol.iterator] instanceof Function && obj.entries instanceof Function
    ? Array.from(obj.entries())
    : Object.entries(obj);
exports.toPairs = toPairs;
/**
 * Applies a function against an accumulator and each key in the object (from left to right).
 *
 * Use Object.keys() to iterate over each key in the object.
 * Use Array.prototype.reduce() to apply the specified function against the given accumulator.
 * @param obj
 * @param fn
 * @param acc
 * @example
 * transform(
 *   { a: 1, b: 2, c: 1 },
 *   (r, v, k) => {
 *     (r[v] || (r[v] = [])).push(k);
 *     return r;
 *   },
 *   {}
 * );
 * // { '1': ['a', 'c'], '2': ['b'] }
 */
const transform = (obj, fn, acc) => Object.keys(obj).reduce((a, k) => fn(a, obj[k], k, obj), acc);
exports.transform = transform;
/**
 * Unflatten an object with the paths for keys.
 *
 * Use nested Array.prototype.reduce() to convert the flat path to a leaf node.
 * Use String.prototype.split() to split each key with a dot delimiter and Array.prototype.reduce() to add objects against the keys.
 * If the current accumulator already contains a value against a particular key, return its value as the next accumulator.
 * Otherwise, add the appropriate key-value pair to the accumulator object and return the value as the accumulator.
 * @param obj
 * @example
 * unflattenObject({ 'a.b.c': 1, d: 1 });
 * // { a: { b: { c: 1 } }, d: 1 }
 *
 * unflattenObject({ 'a.b': 1, 'a.c': 2, d: 3 });
 * // { a: { b: 1, c: 2 }, d: 3 }
 *
 * unflattenObject({ 'a.b.0': 8, d: 3 });
 * // { a: { b: [ 8 ] }, d: 3 }
 *
 */
const unflattenObject = obj => Object.keys(obj).reduce((res, k) => {
    k.split('.').reduce((acc, e, i, keys) => acc[e] ||
        (acc[e] = isNaN(Number(keys[i + 1]))
            ? keys.length - 1 === i
                ? obj[k]
                : {}
            : []), res);
    return res;
}, {});
exports.unflattenObject = unflattenObject;
/**
 * Creates a generator, that walks through all the keys of a given object.
 *
 * Use recursion.
 * Define a generator function, `walk`, that takes an object and an array of keys.
 * Use a `for...of` loop and `Object.keys()` to iterate over the keys of the object.
 * Use `typeof` to check if each value in the given object is itself an object.
 * If so, use the `yield*` expression to recursively delegate to the same generator
 * function, `walk`, appending the current `key` to the array of keys. Otherwise,
 * `yield` an array of keys representing the current path and the value of the given `key`.
 * Use the `yield*` expression to delegate to the `walk` generator function.
 * @param obj
 * @example
 * const obj = {
 *   a: 10,
 *   b: 20,
 *   c: {
 *     d: 10,
 *     e: 20,
 *     f: [30, 40]
 *   },
 *   g: [
 *     {
 *       h: 10,
 *       i: 20
 *     },
 *     {
 *       j: 30
 *     },
 *     40
 *   ]
 * };
 * [...walkThrough(obj)];
 *
 * // [
 * //   [['a'], 10],
 * //   [['b'], 20],
 * //   [['c', 'd'], 10],
 * //   [['c', 'e'], 20],
 * //   [['c', 'f', '0'], 30],
 * //   [['c', 'f', '1'], 40],
 * //   [['g', '0', 'h'], 10],
 * //   [['g', '0', 'i'], 20],
 * //   [['g', '1', 'j'], 30],
 * //   [['g', '2'], 40]
 * // ]
 *
 */
const walkThrough = function* (obj) {
    const walk = function* (x, previous = []) {
        for (let key of Object.keys(x)) {
            if (typeof x[key] === 'object')
                yield* walk(x[key], [...previous, key]);
            else
                yield [[...previous, key], x[key]];
        }
    };
    yield* walk(obj);
};
exports.walkThrough = walkThrough;
//# sourceMappingURL=Objects.js.map