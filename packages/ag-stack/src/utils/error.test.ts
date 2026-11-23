import { _throwErrors } from './error';

test('_throwErrors throws nothing for none, a lone error as is, and several as an AggregateError', () => {
    const first = new Error('first');
    const second = new Error('second');
    expect(() => _throwErrors([])).not.toThrow();
    expect(() => _throwErrors([first])).toThrow(first);
    expect(() => _throwErrors([first, second])).toThrow(expect.objectContaining({ errors: [first, second] }));
});
