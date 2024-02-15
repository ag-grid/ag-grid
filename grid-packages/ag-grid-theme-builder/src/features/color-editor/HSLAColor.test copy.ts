import { expect, test } from 'vitest';
import { HSLAColor } from './HSLAColor';
import { RGBAColor } from './RGBAColor';

test.each([
  [new RGBAColor(0, 0, 0, 0.5), new HSLAColor(0, 0, 0, 0.5)],
  [new RGBAColor(1, 0, 0, 0.5), new HSLAColor(0, 1, 0.5, 0.5)],
  [new RGBAColor(1, 1, 1, 1), new HSLAColor(0, 0, 1, 1)],
])('rgbToHsl(%s)', (input, expected) => {
  expect(HSLAColor.fromRGBA(input)).toEqual(expected);
});
