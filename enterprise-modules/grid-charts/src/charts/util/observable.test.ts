import { Observable, reactive } from "./observable";

class SubComponent {
    foo: string = 'bar';
}

class Component extends Observable {
    subComponent = new SubComponent();
    @reactive(['name']) john = 'smith';
    @reactive(['name']) bob = 'marley';
    @reactive(['style'], 'subComponent.foo') foo: string;
}

class BaseClass extends Observable {
    @reactive(['layout']) foo = 5;

    layoutTriggered = false;

    constructor() {
        super();

        this.addCategoryListener('layout', () => this.layoutTriggered = true);
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
        c.addListener('john', function (component, oldValue, value) {
            expect(arguments.length).toBe(3);
            expect(component).toBe(c);
            expect(oldValue).toBe('smith');
            expect(value).toBe('doe');
            resolve();
        });
    });

    const nameCategoryListenerPromise = new Promise((resolve, reject) => {
        c.addCategoryListener('name', function (component) {
            expect(arguments.length).toBe(1);
            expect(component).toBe(c);
            resolve();
        });
    });

    c.john = 'doe';
    c.foo = 'blah';

    expect(c.foo).toBe('blah');
    expect(c.subComponent.foo).toBe('blah');

    return Promise.all([johnListenerPromise, nameCategoryListenerPromise]);
}, 100);

test('addListener', () => {
    const c = new Component();

    let sum = 0;
    const listener1 = () => { sum += 1 };
    const listener2 = () => { sum += 2 };
    const listener3 = () => { sum += 3 };

    c.addListener('john', listener1);
    c.addListener('john', listener2);
    c.addListener('john', listener3);

    c.john = 'test';

    expect(sum).toBe(6);
});

test('removeListener', () => {
    const c = new Component();

    let triggered = false;

    c.addListener('john', () => { triggered = true });
    c.addListener('john', () => { triggered = true });
    c.addListener('john', () => { triggered = true });

    c.removeListener('john');

    c.john = 'test';

    expect(triggered).toBe(false);
});

test('addCategoryListener', () => {
    const c = new Component();

    let sum = 0;

    c.addCategoryListener('name', () => {
        sum += 1;
    });

    c.john = 'test';
    c.bob = 'test';

    expect(sum).toBe(2);
});

test('removeCategoryListener', () => {
    const c = new Component();

    let triggered = false;

    c.addCategoryListener('name', () => { triggered = true });
    c.addCategoryListener('name', () => { triggered = true });
    c.addCategoryListener('name', () => { triggered = true });

    c.removeCategoryListener('name');

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
