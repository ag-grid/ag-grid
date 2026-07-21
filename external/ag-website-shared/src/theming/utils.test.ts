import { expect, test } from 'vitest';

import { titleCase, unescapeStringLiteral } from './utils';

test.each([
    ['foo', 'Foo'],
    ['foo-bar', 'Foo Bar'],
    ['foo-bar-baz', 'Foo Bar Baz'],
    ['foo bar baz', 'Foo Bar Baz'],
    ['fooBarBaz', 'Foo Bar Baz'],
    ['This is FooBar', 'This Is Foo Bar'],
    ['This is FOO', 'This Is FOO'],
    ['This-is-FOO', 'This Is FOO'],
])('titleCase(%s) -> %s', (input, expected) => {
    expect(titleCase(input)).toBe(expected);
});

test.each([
    [`""`, ''],
    [`"hello"`, 'hello'],
    [`'hello'`, 'hello'],
    [String.raw`"it\'s"`, "it's"],
    [String.raw`'it\'s'`, "it's"],
    [String.raw`"a \"quote\""`, 'a "quote"'],
    [String.raw`"back\\slash"`, 'back\\slash'],
    ['"tick\\`"', 'tick`'],
    [String.raw`"a\nb\tc\rd"`, 'a\nb\tc\rd'],
    [String.raw`"\b\f\v"`, '\b\f\v'],
    [String.raw`"nul\0!"`, 'nul\0!'],
    [String.raw`"\x41\x62"`, 'Ab'],
    [String.raw`"\u00e9A"`, 'éA'],
    [String.raw`"\u{e9}"`, 'é'],
    [String.raw`"\u{1F600}"`, '\u{1F600}'],
    ['"line \\\ncontinuation"', 'line continuation'],
    ['"line \\\r\ncontinuation"', 'line continuation'],
    [String.raw`"identity \a\/\ "`, 'identity a/ '],
])('unescapeStringLiteral(%s) -> %s', (input, expected) => {
    expect(unescapeStringLiteral(input)).toBe(expected);
});

test.each([
    [String.raw`"\x4"`], // too few hex digits
    [String.raw`"\xZZ"`], // not hex
    [String.raw`"\u12"`], // too few hex digits
    [String.raw`"\u{}"`], // empty code point
    [String.raw`"\u{ZZ}"`], // not hex
    [String.raw`"\u{110000}"`], // beyond max code point
    [String.raw`"\u{1F600"`], // unterminated code point
    [String.raw`"\101"`], // octal escape
    [String.raw`"\07"`], // octal escape
])('unescapeStringLiteral(%s) throws', (input) => {
    expect(() => unescapeStringLiteral(input)).toThrow(SyntaxError);
});
