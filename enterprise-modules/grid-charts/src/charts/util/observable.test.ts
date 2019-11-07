import { Observable, reactive } from "./observable";

class SubComponent {
    foo: string = 'bar';
}

class Component extends Observable {
    subComponent = new SubComponent();
    @reactive(['name', 'misc']) john = 'smith';
    @reactive(['name', 'misc']) bob = 'marley';
    @reactive(['style'], 'subComponent.foo') foo: string;
}

class BaseClass extends Observable {
    @reactive(['layout']) foo = 5;

    layoutTriggered = false;

    constructor() {
        super();

        this.addEventListener('layout', () => this.layoutTriggered = true);
    }
}

class SubClass extends BaseClass {
    @reactive(['layout']) bar = 10;
}

test('reactive', async () => {
    const c = new Component();

    expect(c.john).toBe('smith');
    expect(c.foo).toBe('bar');

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
            expect(event.source).toBe(c);
            resolve();
        });
    });

    c.john = 'doe';
    c.foo = 'blah';

    expect(c.foo).toBe('blah');
    expect(c.subComponent.foo).toBe('blah');

    return Promise.all([johnListenerPromise, nameCategoryListenerPromise]);
}, 100);

test('addPropertyListener', () => {
    const c = new Component();

    let sum = 0;
    const listener1 = () => { sum += 1 };
    const listener2 = () => { sum += 2 };
    const listener3 = () => { sum += 3 };

    expect(c.addPropertyListener('john', listener1)).toBe(listener1);
    expect(c.addPropertyListener('john', listener1)).toBe(undefined);
    c.addPropertyListener('john', listener2);
    c.addPropertyListener('john', listener3);

    c.john = 'test';

    expect(sum).toBe(6);
});

test('addPropertyListener', () => {
    const c = new Component();

    let triggered = false;

    c.addPropertyListener('john', () => { triggered = true });
    c.addPropertyListener('john', () => { triggered = true });
    c.addPropertyListener('john', () => { triggered = true });

    c.removePropertyListener('john');

    c.john = 'test';

    expect(triggered).toBe(false);
});

test('addEventListener', () => {
    const c = new Component();

    let sum = 0;

    const listener = () => {
        sum += 1;
    };

    expect(c.addEventListener('name', listener)).toBe(listener);
    expect(c.addEventListener('name', listener)).toBe(undefined);

    c.john = 'test';
    c.bob = 'test';

    expect(sum).toBe(2);
});

test('removeEventListener', () => {
    const c = new Component();

    let triggered = false;

    c.addEventListener('name', () => { triggered = true });
    c.addEventListener('name', () => { triggered = true });
    c.addEventListener('name', () => { triggered = true });

    c.removeEventListener('name');

    c.john = 'test';

    expect(triggered).toBe(false);
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
