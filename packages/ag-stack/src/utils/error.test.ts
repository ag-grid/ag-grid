import { _throwErrors } from './error';

describe('_throwErrors', () => {
    test('does nothing for no errors, throws a single error as is', () => {
        const error = new Error('one');
        expect(() => _throwErrors([])).not.toThrow();
        expect(() => _throwErrors([error, error])).toThrow(error);
    });

    test('throws an AggregateError of the distinct errors when there are several', () => {
        const first = new Error('first');
        const second = new Error('second');
        let thrown: unknown;
        try {
            _throwErrors([first, second, first]);
        } catch (error) {
            thrown = error;
        }
        expect(thrown).toBeInstanceOf(AggregateError);
        expect((thrown as AggregateError).errors).toEqual([first, second]);
    });
});
