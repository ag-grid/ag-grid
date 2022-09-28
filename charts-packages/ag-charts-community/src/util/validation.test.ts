import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import {
    Validate,
    OPT_NUMBER,
    OPT_STRING,
    OPT_DATE,
    OPT_NUMBER_ARRAY,
    COLOR_STRING,
    LESS_THAN,
    AND,
    NUMBER,
    GREATER_THAN,
} from './validation';

class TestValidate {
    @Validate(OPT_NUMBER(0))
    num?: number = undefined;

    @Validate(OPT_STRING)
    str?: string = undefined;

    @Validate(OPT_DATE)
    date?: Date = undefined;

    @Validate(OPT_NUMBER_ARRAY)
    array?: number[] = undefined;

    @Validate(COLOR_STRING)
    colour: string = 'black';

    @Validate(AND(NUMBER(0), LESS_THAN('max')))
    min: number = 0;

    @Validate(AND(NUMBER(undefined, 100), GREATER_THAN('min')))
    max: number = 100;
}

describe('validation module', () => {
    let test: TestValidate;

    beforeEach(() => {
        test = new TestValidate();
        console.warn = jest.fn();
    });

    describe('basic validations', () => {
        describe('OPT_NUMBER', () => {
            it('should set TestValidate.num to undefined without warning', () => {
                test.num = undefined;

                expect(console.warn).not.toBeCalled();
            });

            it('should not set TestValidate.num to null with warning', () => {
                (test as any).num = null;

                expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                expect(test.num).toBe(undefined);
            });

            it('should set TestValidate.num to a valid value without warning', () => {
                test.num = 3;

                expect(console.warn).not.toBeCalled();
                expect(test.num).toBe(3);
            });
        });

        describe('OPT_STRING', () => {
            it('should set TestValidate.str to undefined without warning', () => {
                test.str = undefined;

                expect(console.warn).not.toBeCalled();
            });

            it('should not set TestValidate.str to null with warning', () => {
                (test as any).str = null;

                expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                expect(test.str).toBe(undefined);
            });

            it('should set TestValidate.str to a valid value without warning', () => {
                test.str = 'hello world!';

                expect(console.warn).not.toBeCalled();
                expect(test.str).toBe('hello world!');
            });
        });

        describe('OPT_DATE', () => {
            it('should set TestValidate.date to undefined without warning', () => {
                test.date = undefined;

                expect(console.warn).not.toBeCalled();
            });

            it('should not set TestValidate.date to null with warning', () => {
                (test as any).date = null;

                expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                expect(test.date).toBe(undefined);
            });

            it('should set TestValidate.date to a valid value without warning', () => {
                const date = new Date();
                test.date = date;

                expect(console.warn).not.toBeCalled();
                expect(test.date).toBe(date);
            });
        });

        describe('OPT_NUMBER_ARRAY', () => {
            it('should set TestValidate.array to undefined without warning', () => {
                test.array = undefined;

                expect(console.warn).not.toBeCalled();
            });

            it('should not set TestValidate.array to null with warning', () => {
                (test as any).array = null;

                expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                expect(test.array).toBe(undefined);
            });

            it('should set TestValidate.array to a valid value without warning', () => {
                test.array = [];
                test.array = [1, 2, 3];

                expect(console.warn).not.toBeCalled();
                expect(test.array).toStrictEqual([1, 2, 3]);
            });

            it('should not set TestValidate.array to a invalid value with warning', () => {
                test.array = ['a', 'b', 3] as any;

                expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                expect(test.array).toBe(undefined);
            });
        });

        describe('COLOUR_STRING', () => {
            it('should not set TestValidate.colour to undefined with warning', () => {
                (test as any).colour = undefined;

                expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                expect(test.colour).toBe('black');
            });

            it('should not set TestValidate.colour to null with warning', () => {
                (test as any).colour = null;

                expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                expect(test.colour).toBe('black');
            });

            it('should not set TestValidate.colour to an invalid value with warning', () => {
                test.colour = 'rainbow-unicorn';
                test.colour = 'rgb(ha, ha, ha)';
                test.colour = '#hahahaha';

                expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                expect(test.colour).toBe('black');
            });

            it('should set TestValidate.colour to a valid value without warning', () => {
                test.colour = '#fff';
                test.colour = '#ffffff';
                test.colour = '#ffffffff';
                test.colour = 'rgb(0, 0, 0)';
                test.colour = 'rgba(0, 0, 0, 0)';

                expect(console.warn).not.toBeCalled();
                expect(test.colour).toBe('rgba(0, 0, 0, 0)');
            });
        });
    });

    describe('complex validations', () => {
        describe('AND', () => {
            it('should not set TestValidate.min to an invalid number', () => {
                test.min = 'a' as any;
                test.min = new Date() as any;
                test.min = [] as any;
                test.min = -1;

                expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                expect(test.min).toBe(0);
            });

            it('should not set TestValidate.max to an invalid number', () => {
                test.max = 'a' as any;
                test.max = new Date() as any;
                test.max = [] as any;
                test.max = 101;

                expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                expect(test.max).toBe(100);
            });

            describe('with LESS_THAN', () => {
                it('should not set TestValidate.min to a value > max', () => {
                    test.min = Infinity;
                    test.min = 101;

                    expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                    expect(test.min).toBe(0);
                });

                it('should not set TestValidate.min to a value === max', () => {
                    test.min = test.max;

                    expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                    expect(test.min).toBe(0);
                });

                it('should set TestValidate.min to a value < max', () => {
                    test.min = 5;
                    test.min = 99;

                    expect(console.warn).not.toHaveBeenCalled();
                    expect(test.min).toBe(99);
                });
            });

            describe('with GREATER_THAN', () => {
                it('should not set TestValidate.max to a value < min', () => {
                    test.max = Infinity;
                    test.max = -1;

                    expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                    expect(test.max).toBe(100);
                });

                it('should not set TestValidate.max to a value === min', () => {
                    test.max = test.min;

                    expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/cannot be set to/));
                    expect(test.max).toBe(100);
                });

                it('should set TestValidate.max to a value > min', () => {
                    test.max = 99;
                    test.max = 1;

                    expect(console.warn).not.toHaveBeenCalled();
                    expect(test.max).toBe(1);
                });
            });
        });
    });
});
