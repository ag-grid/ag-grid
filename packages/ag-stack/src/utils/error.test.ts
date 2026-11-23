import { _throwErrors } from './error';

test('_throwErrors throws nothing for an empty array, and an AggregateError of an error or of the errors in an array', () => {
    const first = new Error('first');
    const second = new Error('second');
    expect(() => _throwErrors([])).not.toThrow();
    expect(() => _throwErrors(first)).toThrow(expect.objectContaining({ errors: [first] }));
    expect(() => _throwErrors([first])).toThrow(expect.objectContaining({ errors: [first] }));
    expect(() => _throwErrors([first, second])).toThrow(expect.objectContaining({ errors: [first, second] }));
});
