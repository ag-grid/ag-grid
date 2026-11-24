import { _throwErrors } from './error';

test('_throwErrors throws nothing for none, the one error as it is, and an AggregateError of several', () => {
    const first = new Error('first');
    const second = new Error('second');
    expect(() => _throwErrors([])).not.toThrow();
    expect(() => _throwErrors([first])).toThrow(first);
    expect(() => _throwErrors([first, second])).toThrow(expect.objectContaining({ errors: [first, second] }));
});
