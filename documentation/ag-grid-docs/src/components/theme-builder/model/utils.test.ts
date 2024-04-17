import { expect, test } from 'vitest';
import { titleCase } from './utils';

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
