import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { Deprecated, DeprecatedAndRenamedTo } from './deprecation';
import { clearDoOnceFlags } from './function';

interface TestDeprecationObject {
    usualProp: number;
    deprecatedProp: number;
    beforeRename: number;
    afterRename: number;
    nestedBeforeRename: { prop: number };
    nestedAfterRename: { prop: number };
}

describe('deprecation module', () => {
    let test: TestDeprecationObject;
    const originalConsoleWarn = console.warn;

    beforeEach(() => {
        clearDoOnceFlags();

        class TestDeprecation implements TestDeprecationObject {
            usualProp = 7;

            @Deprecated('Use validPrimitive instead', { default: 7 })
            deprecatedProp = 7;

            afterRename = 7;

            @DeprecatedAndRenamedTo('afterRename')
            beforeRename = 7;

            nestedAfterRename = { prop: 7 };

            @DeprecatedAndRenamedTo('nestedAfterRename')
            nestedBeforeRename = this.nestedAfterRename;
        }
        console.warn = jest.fn();
        test = new TestDeprecation();
    });

    afterEach(() => {
        console.warn = originalConsoleWarn;
    });

    describe('@Deprecated decorator', () => {
        describe('property deprecation', () => {
            it('should warn if deprecated property is assigned a value', () => {
                test.deprecatedProp = 999;
                expect(console.warn).toBeCalled();
                expect(test.deprecatedProp).toBe(999);
            });

            it('should not warn if deprecated property is assigned a default value', () => {
                test.deprecatedProp = 7;
                expect(console.warn).not.toBeCalled();
                expect(test.deprecatedProp).toBe(7);
            });

            it('should not warn if un-deprecated property is assigned', () => {
                test.usualProp = 999;
                expect(console.warn).not.toBeCalled();
                expect(test.usualProp).toBe(999);
            });
        });

        describe('property deprecation by rename', () => {
            it('should warn if deprecated renamed property is assigned a value', () => {
                test.beforeRename = 999;
                expect(console.warn).toBeCalled();
                expect(test.beforeRename).toBe(999);
            });

            it('should reflect renamed deprecated property changes', () => {
                test.beforeRename = 999;
                expect(test.afterRename).toBe(999);
                expect(test.beforeRename).toBe(999);
            });

            it('should not warn if renamed deprecated property value was not changed', () => {
                test.beforeRename = 7;
                expect(console.warn).not.toBeCalled();
                expect(test.beforeRename).toBe(7);
            });

            it('should not warn if renamed property is assigned', () => {
                test.afterRename = 999;
                expect(console.warn).not.toBeCalled();
                expect(test.afterRename).toBe(999);
            });

            it('should warn if nested renamed property was accessed', () => {
                test.nestedBeforeRename.prop = 999;
                expect(console.warn).toBeCalled();
                expect(test.nestedAfterRename.prop).toBe(999);
                expect(test.nestedBeforeRename.prop).toBe(999);
            });
        });

        describe('describe deprecation warnings', () => {
            it('should show the deprecation warning once', () => {
                test.deprecatedProp = 999;
                test.deprecatedProp = -100;
                expect(console.warn).toBeCalledTimes(1);
            });

            it('should show the deprecation by rename warning once', () => {
                test.beforeRename = 999;
                test.beforeRename = -100;
                expect(console.warn).toBeCalledTimes(1);
            });
        });
    });
});
