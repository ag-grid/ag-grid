import { expect, test } from 'vitest';
import { RGBAColor } from './RGBAColor';

test.each([
  ['color(srgb 0 0.1 0.2 / 0.3)', new RGBAColor(0, 0.1, 0.2, 0.3)],
  ['color(srgb 0 0.1 0.2 / 50%)', new RGBAColor(0, 0.1, 0.2, 0.5)],
  ['color(srgb 1 0.9 0.8)', new RGBAColor(1, 0.9, 0.8, 1)],
  ['color(foo 1 0.9 0.8)', null],
  ['rgb(0, 5, 255)', new RGBAColor(0, 5 / 255, 1, 1)],
  ['rgba(0, 5, 255, 0.4)', new RGBAColor(0, 5 / 255, 1, 0.4)],
  ['rgba(0, 5, 255, 40%)', new RGBAColor(0, 5 / 255, 1, 0.4)],
  ['foo(0, 5, 255, 40%)', null],
])('parseCss("%s")', (input, expected) => {
  expect(RGBAColor.parseCss(input)).toEqual(expected);
});
