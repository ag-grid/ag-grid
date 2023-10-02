import { expect, test } from 'vitest';
import { color, colorWithAlpha, colorWithSelfOverlay } from './color';

test(color, () => {
  expect(color('#aabbccff').hex).toEqual('#aabbccff');
  expect(color('aabbcc').hex).toEqual('#aabbcc');
  expect(color('#abc').hex).toEqual('#aabbcc');
  expect(color('abc').hex).toEqual('#aabbcc');
  expect(color('#abcf').hex).toEqual('#aabbccff');
  expect(color('abcf').hex).toEqual('#aabbccff');
});

test(colorWithAlpha, () => {
  expect(colorWithAlpha(color('#aabbcc'), 0).hex).toEqual('#aabbcc00');
  expect(colorWithAlpha(color('#aabbcc'), 0.5).hex).toEqual('#aabbcc80');
  expect(colorWithAlpha(color('#aabbcc'), 1).hex).toEqual('#aabbccff');
  expect(colorWithAlpha(color('#aabbcc80'), 0).hex).toEqual('#aabbcc00');
  expect(colorWithAlpha(color('#aabbcc80'), 0.5).hex).toEqual('#aabbcc40');
  expect(colorWithAlpha(color('#aabbcc80'), 1).hex).toEqual('#aabbcc80');
});

test(colorWithSelfOverlay, () => {
  expect(colorWithSelfOverlay(color('#aabbcc80'), 1).hex).toEqual('#aabbcc80');
  expect(colorWithSelfOverlay(color('#aabbcc80'), 2).hex).toEqual('#aabbccc0');
  expect(colorWithSelfOverlay(color('#aabbccff'), 2).hex).toEqual('#aabbccff');
  expect(colorWithSelfOverlay(color('#aabbcc00'), 2).hex).toEqual('#aabbcc00');
});
