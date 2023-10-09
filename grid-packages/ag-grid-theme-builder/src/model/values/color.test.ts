import { expect, test } from 'vitest';
import { color } from './color';

test(color, () => {
  expect(color('#aabbccff').hex).toEqual('#aabbccff');
  expect(color('aabbcc').hex).toEqual('#aabbcc');
  expect(color('#abc').hex).toEqual('#aabbcc');
  expect(color('abc').hex).toEqual('#aabbcc');
  expect(color('#abcf').hex).toEqual('#aabbccff');
  expect(color('abcf').hex).toEqual('#aabbccff');
});
