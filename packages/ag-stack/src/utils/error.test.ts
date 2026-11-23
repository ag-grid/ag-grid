import { _throwErrors } from './error';

test('_throwErrors throws nothing for none, and an AggregateError of the errors otherwise', () => {
    const first = new Error('first');
    const second = new Error('second');
    expect(() => _throwErrors([])).not.toThrow();
    expect(() => _throwErrors([first])).toThrow(expect.objectContaining({ errors: [first] }));
    expect(() => _throwErrors([first, second])).toThrow(expect.objectContaining({ errors: [first, second] }));
});
