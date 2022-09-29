import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { Deprecated } from './deprecation';

interface TestDeprecationObject {
    validPrimitive: number;
    validObject: { prop: number };
    deprecatedPrimitive: number;
    deprecatedObject: { prop: number };
    deprecatedPrimitiveWithAccessors: number;
}

describe('deprecation module', () => {
    let test: TestDeprecationObject;
    let originalConsoleWarn: Console['warn'];

    beforeEach(() => {
        class TestDeprecation implements TestDeprecationObject {
            validPrimitive = 7;

            validObject = { prop: 7 };

            @Deprecated('Use validPrimitive instead', { default: 7 })
            deprecatedPrimitive = 7;

            @Deprecated('Use validObject instead', {
                accessors: {
                    get: (target) => target.validObject,
                    set: (target, value) => (target.validObject = value),
                },
            })
            deprecatedObject = this.validObject;

            @Deprecated('Use validPrimitive instead', {
                accessors: {
                    get: (target) => target.validPrimitive,
                    set: (target, value) => (target.validPrimitive = value),
                },
            })
            deprecatedPrimitiveWithAccessors = 7;
        }
        originalConsoleWarn = console.warn;
        test = new TestDeprecation();
        console.warn = jest.fn();
    });

    afterEach(() => {
        console.warn = originalConsoleWarn;
    });

    describe('@Deprecated decorator', () => {
        describe('primitive property deprecation', () => {
            it('should not warn if valid property is assigned', () => {
                test.validPrimitive = 999;
                expect(console.warn).not.toBeCalled();
                expect(test.validPrimitive).toBe(999);
            });

            it('should not warn if deprecated property is assigned a default value', () => {
                test.deprecatedPrimitive = 7;
                expect(console.warn).not.toBeCalled();
                expect(test.deprecatedPrimitive).toBe(7);
            });

            it('should warn if deprecated property is assigned a value', () => {
                test.deprecatedPrimitive = 999;
                expect(console.warn).toBeCalled();
                expect(test.deprecatedPrimitive).toBe(999);
            });
        });

        describe('describe object property deprecation', () => {
            it('should not warn if a property of a valid object is assigned', () => {
                test.validObject.prop = 999;
                expect(console.warn).not.toBeCalled();
                expect(test.validObject.prop).toBe(999);
            });

            it('should reflect changes of a valid object in a deprecated object', () => {
                test.validObject.prop = 999;
                expect(test.validObject.prop).toBe(999);
                expect(test.deprecatedObject.prop).toBe(999);
            });

            it('should warn if a property of a deprecated object is assigned', () => {
                test.deprecatedObject.prop = 999;
                expect(console.warn).toBeCalled();
                expect(test.deprecatedObject.prop).toBe(999);
            });

            it('should reassign to a valid object', () => {
                test.deprecatedObject.prop = 999;
                expect(test.deprecatedObject.prop).toBe(999);
                expect(test.validObject.prop).toBe(999);
            });
        });

        describe('describe primitive property deprecation with accessors', () => {
            it('should not warn if a deprecated primitive with accessors is assigned the same value as a valid primitive', () => {
                test.deprecatedPrimitiveWithAccessors = 7;
                expect(console.warn).not.toBeCalled();
                expect(test.deprecatedPrimitiveWithAccessors).toBe(7);
            });

            it('should warn if a deprecated primitive with accessors is assigned', () => {
                test.deprecatedPrimitiveWithAccessors = 999;
                expect(console.warn).toBeCalled();
                expect(test.deprecatedPrimitiveWithAccessors).toBe(999);
            });

            it('should reflect changes of a valid primitive in a deprecated primitive with accessors', () => {
                test.validPrimitive = 999;
                expect(console.warn).not.toBeCalled();
                expect(test.validPrimitive).toBe(999);
                expect(test.deprecatedPrimitiveWithAccessors).toBe(999);
            });

            it('should reflect changes of a deprecated primitive with accessors in a valid primitive', () => {
                test.deprecatedPrimitiveWithAccessors = 999;
                expect(console.warn).toBeCalled();
                expect(test.deprecatedPrimitiveWithAccessors).toBe(999);
                expect(test.validPrimitive).toBe(999);
            });
        });

        describe('describe deprecation warnings', () => {
            it('should primitive deprecation warning to be called once', () => {
                test.deprecatedPrimitive = 999;
                test.deprecatedPrimitive = -100;
                expect(console.warn).toBeCalledTimes(1);
                expect(test.deprecatedPrimitiveWithAccessors).toBe(7);
            });

            it('should warn if a deprecated primitive with accessors is assigned', () => {
                test.deprecatedPrimitiveWithAccessors = 999;
                expect(console.warn).toBeCalled();
                expect(test.deprecatedPrimitiveWithAccessors).toBe(999);
            });

            it('should reflect changes of a valid primitive in a deprecated primitive with accessors', () => {
                test.validPrimitive = 999;
                expect(console.warn).not.toBeCalled();
                expect(test.validPrimitive).toBe(999);
                expect(test.deprecatedPrimitiveWithAccessors).toBe(999);
            });

            it('should reflect changes of a deprecated primitive with accessors in a valid primitive', () => {
                test.deprecatedPrimitiveWithAccessors = 999;
                expect(console.warn).toBeCalled();
                expect(test.deprecatedPrimitiveWithAccessors).toBe(999);
                expect(test.validPrimitive).toBe(999);
            });
        });
    });
});
