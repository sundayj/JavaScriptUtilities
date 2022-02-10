import {Objects} from "../src";

test('Gets the specified values from the object', () => {
    const obj = {
        selector: { to: { val: 'val to select' } },
        target: [1, 2, { a: 'test' }],
    };
    expect(Objects.get(obj, 'selector.to.val', 'target[0]', 'target[2].a'))
        .toStrictEqual(['val to select', 1, 'test']);
});

test('Deeply merges two objects', () => {
    expect(Objects.deepMerge(
        { a: true, b: { c: [1, 2, 3] } },
        { a: false, b: { d: [1, 2, 3] } },
        (key: string, a: any, b: any) => (key === 'a' ? a && b : Object.assign({}, a, b))
        )
    ).toStrictEqual({ a: false, b: { c: [ 1, 2, 3 ], d: [ 1, 2, 3 ] } })
});

test('JSON to CSV', () => {
    expect(
        Objects.JSONtoCSV(
            [{ a: 1, b: 2 }, { a: 3, b: 4, c: 5 }, { a: 6 }, { b: 7 }],
            ['a', 'b']
        )
    ).toBe('a,b\n"1","2"\n"3","4"\n"6",""\n"","7"');
});

test('Rename Keys', () => {
    const obj = { name: 'Bobo', job: 'Front-End Master', shoeSize: 100 };
    expect(
        Objects.renameKeys({ name: 'firstName', job: 'passion' }, obj)
    ).toStrictEqual({ firstName: 'Bobo', passion: 'Front-End Master', shoeSize: 100 });
});

test('CSV to JSON', () => {
    expect(
        Objects.CSVToJSON('col1,col2\na,b\nc,d')
    ).toStrictEqual([{'col1': 'a', 'col2': 'b'}, {'col1': 'c', 'col2': 'd'}]);
});

test('CSV to JSON with Delimiter', () => {
    expect(
        Objects.CSVToJSON('col1;col2\na;b\nc;d', ';')
    ).toStrictEqual([{'col1': 'a', 'col2': 'b'}, {'col1': 'c', 'col2': 'd'}]);
});

test('Compact Object', () => {
    const obj = {
        a: null,
        b: false,
        c: true,
        d: 0,
        e: 1,
        f: '',
        g: 'a',
        h: [null, false, '', true, 1, 'a'],
        i: { j: 0, k: false, l: 'a' }
    };
    expect(
        Objects.compactObject(obj)
    ).toStrictEqual({ c: true, e: 1, g: 'a', h: [ true, 1, 'a' ], i: { l: 'a' } });
});

test('Count By Test 1', () => {
    expect(
        Objects.countBy([6.1, 4.2, 6.3], Math.floor)
    ).toStrictEqual({4: 1, 6: 2});
});

test('Count By Test 2', () => {
    expect(
        Objects.countBy(['one', 'two', 'three'], 'length')
    ).toStrictEqual({3: 2, 5: 1});
});

test('Count By Test 3', () => {
    expect(
        Objects.countBy([{ count: 5 }, { count: 10 }, { count: 5 }], x => x.count)
    ).toStrictEqual({5: 2, 10: 1});
});

test('Group By Test 1', () => {
    expect(
        Objects.groupBy([6.1, 4.2, 6.3], Math.floor)
    ).toStrictEqual({4: [4.2], 6: [6.1, 6.3]});
});

test('Group By Test 2', () => {
    expect(
        Objects.groupBy(['one', 'two', 'three'], 'length')
    ).toStrictEqual({3: ['one', 'two'], 5: ['three']});
});

test('Query String to Object', () => {
    expect(
        Objects.queryStringToObject('https://google.com?page=1&count=10')
    ).toStrictEqual({page: '1', count: '10'});
});

test('Stringify Circular JSON', () => {
    const obj = { n: 42,
        obj: {}
    };
    obj.obj = obj;
    expect(
        Objects.stringifyCircularJSON(obj)
    ).toBe('{"n":42}');
});

test('To Pairs 1', () => {
    expect(
        Objects.toPairs({ a: 1, b: 2 })
    ).toStrictEqual([['a', 1], ['b', 2]]);
});

test('To Pairs 2', () => {
    expect(
        Objects.toPairs([2, 4, 8])
    ).toStrictEqual([[0, 2], [1, 4], [2, 8]]);
});

test('To Pairs 3', () => {
    expect(
        Objects.toPairs('shy')
    ).toStrictEqual([['0', 's'], ['1', 'h'], ['2', 'y']]);
});

test('To Pairs 4', () => {
    expect(
        Objects.toPairs(new Set(['a', 'b', 'c', 'a']))
    ).toStrictEqual([['a', 'a'], ['b', 'b'], ['c', 'c']]);
});

test('Transform', () => {
    expect(
        Objects.transform({ a: 1, b: 2, c: 1 },
            (r, v, k) => {
                (r[v] || (r[v] = [])).push(k);
                return r;
            },
            {})
    ).toStrictEqual({ '1': ['a', 'c'], '2': ['b'] });
});

test('Unflatten Object 1', () => {
    expect(
        Objects.unflattenObject({ 'a.b.c': 1, d: 1 })
    ).toStrictEqual({ a: { b: { c: 1 } }, d: 1 });
});

test('Unflatten Object 2', () => {
    expect(
        Objects.unflattenObject({ 'a.b': 1, 'a.c': 2, d: 3 })
    ).toStrictEqual({ a: { b: 1, c: 2 }, d: 3 });
});

test('Unflatten Object 3', () => {
    expect(
        Objects.unflattenObject({ 'a.b.0': 8, d: 3 })
    ).toStrictEqual({ a: { b: [ 8 ] }, d: 3 });
});

test('Walk Through', () => {
    const obj = {
        a: 10,
        b: 20,
        c: {
            d: 10,
            e: 20,
            f: [30, 40]
        },
        g: [
            {
                h: 10,
                i: 20
            },
            {
                j: 30
            },
            40
        ]
    };
    // @ts-ignore
    expect([...Objects.walkThrough(obj)])
        .toStrictEqual(
            [[['a'], 10], [['b'], 20], [['c', 'd'], 10], [['c', 'e'], 20], [['c', 'f', '0'], 30], [['c', 'f', '1'], 40], [['g', '0', 'h'], 10], [['g', '0', 'i'], 20], [['g', '1', 'j'], 30], [['g', '2'], 40]]
        );
});
