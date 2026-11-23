import { _throwErrors } from './error';

test('_throwErrors throws nothing for none, a lone error as is, and several distinct ones as an AggregateError', () => {
    const first = new Error('first');
    const second = new Error('second');
    expect(() => _throwErrors([])).not.toThrow();
    expect(() => _throwErrors([first, first])).toThrow(first);
    expect(() => _throwErrors([first, second, first])).toThrow(expect.objectContaining({ errors: [first, second] }));
});
