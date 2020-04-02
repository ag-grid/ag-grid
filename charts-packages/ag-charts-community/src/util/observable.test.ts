import { Observable, reactive } from "./observable";

class SubComponent {
    foo: string = 'bar';
}

class Component extends Observable {
    @reactive('name', 'misc') john = 'smith';
    @reactive('name', 'misc') bob = 'marley';
    @reactive('change') foo: string;
    @reactive() arr: [] | undefined | null = [];
    @reactive() obj: {} | undefined | null = {};
}

class BaseClass extends Observable {
    @reactive('layout') foo = 5;

    layoutTriggered = false;

    constructor() {
        super();

        this.addEventListener('layout', () => this.layoutTriggered = true);
    }
}

class SubClass extends BaseClass {
    @reactive('layout') bar = 10;
}

test('reactive', async () => {
    const c = new Component();

    expect(c.john).toBe('smith');

    const johnListenerPromise = new Promise((resolve, reject) => {
        c.addPropertyListener('john', event => {
            expect(event.type).toBe('john');
            expect(event.source).toBe(c);
            expect(event.oldValue).toBe('smith');
            expect(event.value).toBe('doe');
            resolve();
        });
    });

    const nameCategoryListenerPromise = new Promise((resolve, reject) => {
        c.addEventListener('name', event => {
            expect(event.type).toBe('name');
            resolve();
        });
    });

    c.john = 'doe';
    c.foo = 'blah';

    expect(c.foo).toBe('blah');

    return Promise.all([johnListenerPromise, nameCategoryListenerPromise]);
}, 100);

test('addPropertyListener', () => {
    const c = new Component();

    let sum = 0;
    const listener1 = () => { sum += 1 };
    const listener2 = () => { sum += 2 };
    const listener3 = () => { sum += 3 };

    expect(c.addPropertyListener('john', listener1)).toBe(undefined);
    c.addPropertyListener('john', listener2);
    c.addPropertyListener('john', listener3);

    c.john = 'test';

    expect(sum).toBe(6);
});

test('addPropertyListener', () => {
    const c = new Component();

    let sum = 0;

    const listener1 = () => { sum += 1 };
    const listener2 = () => { sum += 3 };
    const listener3 = () => { sum += 5 };

    c.addPropertyListener('john', listener1);
    c.addPropertyListener('john', listener2);
    c.addPropertyListener('john', listener3);
    c.john = 'test1';
    expect(sum).toBe(9);
    sum = 0;
    c.john = 'test1'; // value hasn't changed, no events fired
    expect(sum).toBe(0);

    sum = 0;
    c.removePropertyListener('john', listener1);
    c.john = 'test2';
    expect(sum).toBe(8);

    sum = 0;
    c.removePropertyListener('john', listener2);
    c.john = 'test3';
    expect(sum).toBe(5);

    sum = 0;
    c.removePropertyListener('john', listener3);
    c.john = 'test4';
    expect(sum).toBe(0);
});

test('addEventListener', () => {
    const c = new Component();

    let sum = 0;

    let eventSource: any;
    let listener1Scope: any;
    expect(c.addEventListener('name', function (event) {
        eventSource = event.source;
        listener1Scope = this;
        sum += 1;
    })).toBe(undefined);

    const that = {};
    let listener2Scope: any;
    c.addEventListener('name', function (event) {
        listener2Scope = this;
    }, that);

    c.john = 'test';
    c.bob = 'test';

    expect(sum).toBe(2);
    expect(eventSource).toBe(c);
    expect(listener1Scope).toBe(c);
    expect(listener2Scope).toBe(that);

    let arrChange = false;
    c.addPropertyListener('arr', () => arrChange = true);
    c.arr = [];
    expect(arrChange).toBe(true);
    arrChange = false;
    c.arr = null;
    expect(arrChange).toBe(true);
    arrChange = false;
    c.arr = null;
    expect(arrChange).toBe(false);
    c.arr = undefined;
    expect(arrChange).toBe(true);

    let objChange = false;
    c.addPropertyListener('obj', () => objChange = true);
    c.obj = {};
    expect(objChange).toBe(true);
    objChange = false;
    c.obj = null;
    expect(objChange).toBe(true);
    objChange = false;
    c.obj = null;
    expect(objChange).toBe(false);
    c.obj = undefined;
    expect(objChange).toBe(true);
});

test('removeEventListener', () => {
    const c = new Component();

    let sum = 0;

    const listener1 = () => { sum += 1 };
    const listener2 = () => { sum += 3 };
    const listener3 = () => { sum += 5 };

    c.addEventListener('name', listener1);
    c.addEventListener('name', listener2);
    c.addEventListener('name', listener3);

    c.john = 'test1';
    expect(sum).toBe(9);
    sum = 0;
    c.john = 'test1'; // value hasn't changed, no events fired
    expect(sum).toBe(0);

    sum = 0;
    c.removeEventListener('name', listener1);
    c.john = 'test2';
    expect(sum).toBe(8);

    sum = 0;
    c.removeEventListener('name', listener2);
    c.john = 'test3';
    expect(sum).toBe(5);

    sum = 0;
    c.removeEventListener('name', listener3);
    c.john = 'test4';
    expect(sum).toBe(0);

    let scopeSum = 0;
    function listener4() {
        scopeSum += this.$value || 1;
    }

    const scope1 = { $value: 5 };
    const scope2 = { $value: 7 };

    c.addEventListener('change', listener4);
    c.addEventListener('change', listener4, scope1);
    c.addEventListener('change', listener4, scope2);
    c.foo = 'lalala';
    expect(scopeSum).toBe(13);

    c.removeEventListener('change', listener4, scope2);
    scopeSum = 0;
    c.foo = 'lala';
    expect(scopeSum).toBe(6);

    c.removeEventListener('change', listener4, scope1);
    scopeSum = 0;
    c.foo = 'la';
    expect(scopeSum).toBe(1);

    c.removeEventListener('change', listener4);
    scopeSum = 0;
    c.foo = '';
    expect(scopeSum).toBe(0);
});

test('inheritance', () => {
    const subClass = new SubClass();

    subClass.bar = 42;

    expect(subClass.layoutTriggered).toBe(true);

    subClass.layoutTriggered = false;

    subClass.foo = 42;

    expect(subClass.layoutTriggered).toBe(true);
});

test('listener call order', () => {
    const c = new Component();

    let name = 2;
    let category = 2;
    let category2 = 2;

    c.addPropertyListener('bob', () => {
        name += 2;
        category += 2;
    });
    c.addPropertyListener('john', () => {
        name *= 3;
        category *= 3;
    });

    c.addEventListener('name', () => {
        category += 4;
        category2 += 2;
    });
    c.addEventListener('misc', () => {
        category2 *= 3;
    });

    c.bob = 'aaa';
    c.john = 'bbb';

    expect(name).toBe(12); // (2 + 2) * 3
    expect(category).toBe(28); // (2 + 2 + 4) * 3 + 4
    expect(category2).toBe(42); // ((2 + 2) * 3 + 2) * 3
});
