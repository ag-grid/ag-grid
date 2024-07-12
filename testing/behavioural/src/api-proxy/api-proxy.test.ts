import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { isProxy } from 'util/types';

describe('ag-grid api proxy', () => {
    let consoleWarnSpy: jest.SpyInstance | undefined;
    let consoleErrorSpy: jest.SpyInstance | undefined;

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeAll(() => {
        ModuleRegistry.register(ClientSideRowModelModule);
    });

    beforeEach(() => {
        resetGrids();
    });

    afterEach(() => {
        consoleWarnSpy?.mockRestore();
        consoleErrorSpy?.mockRestore();
    });

    describe('gridApi as a normal JS object', () => {
        test('prototype chain', () => {
            const gridApi = createMyGrid({});
            const gridApiProto = Object.getPrototypeOf(gridApi);

            expect(isProxy(gridApi)).toBe(false);

            expect(typeof gridApi).toBe('object');
            expect(typeof gridApiProto).toBe('object');
            expect(Object.getPrototypeOf(gridApiProto)).toBe(Object.prototype);
            expect(gridApi).toBeInstanceOf(Object);
            expect(gridApiProto).toBeInstanceOf(Object);
        });

        test('__proto__', () => {
            const gridApi = createMyGrid({});
            const gridApiProto = Object.getPrototypeOf(gridApi);

            expect(gridApiProto.__proto__).toBe(Object.prototype);
            expect((gridApi as any).__proto__).toBe(Object.prototype);

            expect('__proto__' in {}).toBe(true);
            expect('__proto__' in gridApi).toBe(true);
            expect('__proto__' in gridApiProto).toBe(true);
        });

        test.each(Object.getOwnPropertyNames(Object.prototype))('Object.prototype.%s', (key) => {
            const gridApi = createMyGrid({});
            const gridApiProto = Object.getPrototypeOf(gridApi);

            expect(key in gridApi).toBe(true);
            expect(key in gridApiProto).toBe(true);

            // The property must be defined in the parent parent prototype
            expect(Object.getOwnPropertyDescriptor({}, key)).toBeUndefined();
            expect(Object.getOwnPropertyDescriptor(gridApi, key)).toBeUndefined();
            expect(Object.getOwnPropertyDescriptor(gridApiProto, key)).toBeUndefined();

            expect(gridApi[key]).toBe(key === '__proto__' ? Object.prototype : Object.prototype[key]);
        });

        test('bean property beanName', () => {
            const gridApi = createMyGrid({});
            const gridApiProto = Object.getPrototypeOf(gridApi);

            expect('beanName' in gridApi).toBe(false);
            expect((gridApi as any).beanName).toBeUndefined();

            expect('beanName' in gridApiProto).toBe(false);
            expect((gridApiProto as any).beanName).toBeUndefined();
        });

        test.each(['preWireBeans', 'wireBeans', 'preConstruct', 'postConstruct'])('Bean method %s', (key) => {
            const gridApi = createMyGrid({});

            expect(key in gridApi).toBe(false);
            expect(typeof (gridApi as any)[key]).toBe('function');

            // Check that the function name is correct
            expect((gridApi as any)[key].name).toEqual(key);

            // Check it is always the same instance
            expect((gridApi as any)[key]).toBe((gridApi as any)[key]);
        });

        test('gridApi prototype is a frozen proxy', () => {
            const gridApi = createMyGrid({});
            const gridApiProto = Object.getPrototypeOf(gridApi);

            expect(Object.isFrozen(gridApiProto)).toBe(true);
            expect(isProxy(gridApiProto)).toBe(true);
            expect(() => {
                gridApiProto.foo = 'bar';
            }).toThrow(new TypeError('Cannot define property foo, object is not extensible'));
            expect('foo' in gridApiProto).toBe(false);
        });

        test('gridApi is writable', () => {
            const gridApi = createMyGrid({});
            const gridApiProto = Object.getPrototypeOf(gridApi);

            (gridApi as any).foo = 'bar';
            expect('foo' in gridApi).toBe(true);
            expect((gridApi as any).foo).toBe('bar');

            expect('foo' in gridApiProto).toBe(false);
        });

        test.each(['toJSON', 'then', 'catch', 'finally'])('Forbidden method %s', (key) => {
            const gridApi = createMyGrid({});

            expect(key in gridApi).toBe(false);
            expect((gridApi as any)[key]).toBeUndefined();
            expect((gridApi as any)[key]).toBeUndefined();
        });
    });

    test('dispatchEvent', () => {
        const gridApi = createMyGrid({});

        expect('dispatchEvent' in gridApi).toBe(true);
        expect(typeof gridApi.dispatchEvent).toBe('function');

        expect(gridApi.dispatchEvent).toBe(gridApi.dispatchEvent); // same instance check
    });

    test('unknown API function', () => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const gridApi = createMyGrid({});

        expect('unknownFn' in gridApi).toBe(false);

        const unknownFn = (gridApi as any).unknownFn;
        expect(typeof unknownFn).toBe('function');
        expect((gridApi as any).unknownFn).toBe(unknownFn); // same instance check

        expect('unknownFn' in gridApi).toBe(false);

        unknownFn();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

        unknownFn();
        unknownFn();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
});
