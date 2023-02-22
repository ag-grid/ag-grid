import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { Default } from './default';

class DefaultTest {
    @Default('not set')
    testUndefined: string = 'unset';

    @Default('not set', [null])
    testNull: string = 'unset';

    @Default('not set', [NaN])
    testNaN: string | number = 'unset';

    @Default('not set', [undefined, null, '', NaN])
    testMulti: string | number = 'unset';
}

describe('@Default', () => {
    let test: DefaultTest;
    const originalConsoleWarn = console.warn;

    beforeEach(() => {
        console.warn = jest.fn();
        test = new DefaultTest();
    });

    afterEach(() => {
        console.warn = originalConsoleWarn;
    });

    it('should allow non-default mapping to be set', () => {
        test.testUndefined = 'set undefined';
        test.testNull = 'set null';
        test.testNaN = 'set NaN';
        test.testMulti = 'set multi';

        expect(test.testUndefined).toEqual('set undefined');
        expect(test.testNull).toEqual('set null');
        expect(test.testNaN).toEqual('set NaN');
        expect(test.testMulti).toEqual('set multi');
    });

    it('should allow default mapping to reset property value', () => {
        test.testUndefined = undefined;
        test.testNull = null;
        test.testNaN = NaN;

        expect(test.testUndefined).toEqual('not set');
        expect(test.testNull).toEqual('not set');
        expect(test.testNaN).toEqual('not set');
    });

    it('should allow default multi-mapping to reset property value', () => {
        for (const resetValue of [undefined, null, '', NaN]) {
            test.testMulti = resetValue;
            expect(test.testMulti).toEqual('not set');
        }
    });
});
