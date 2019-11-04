import { Observable, reactive } from "./observable";

class SubComponent {
    foo: string = 'bar';
}

class Component extends Observable {
    subComponent = new SubComponent();
    @reactive(['name']) john = 'smith';
    @reactive(['style'], 'subComponent.foo') foo: string;
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
