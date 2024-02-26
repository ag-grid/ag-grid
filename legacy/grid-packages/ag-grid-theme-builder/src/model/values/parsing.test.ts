import { expect, test } from 'vitest';
import { Border } from './Border';
import { BorderStyle } from './BorderStyle';
import { Color } from './Color';
import { Dimension } from './Dimension';

test(Color, () => {
  const parse = (input: string) => Color.parseCss(input)?.toCss();
  expect(parse('#010203')).toMatchInlineSnapshot('"rgb(1, 2, 3)"');
  expect(parse('#aabbcc')).toMatchInlineSnapshot('"rgb(170, 187, 204)"');
  expect(parse('#abc')).toMatchInlineSnapshot('"rgb(170, 187, 204)"');
  expect(parse('#ABC')).toMatchInlineSnapshot('"rgb(170, 187, 204)"');
  expect(parse('#AAbbcc88')).toMatchInlineSnapshot('"rgba(170, 187, 204, 0.53)"');
  expect(parse('#abC8')).toMatchInlineSnapshot('"rgba(170, 187, 204, 0.53)"');
  expect(parse('rgb(0, 255, 0)')).toMatchInlineSnapshot('"rgb(0, 255, 0)"');
  expect(parse('rgba(0, 255, 0, 0.5)')).toMatchInlineSnapshot('"rgba(0, 255, 0, 0.5)"');
  expect(parse('hsl(120, 100%, 50%)')).toMatchInlineSnapshot('"rgb(0, 255, 0)"');
  expect(parse('hsla(120, 100%, 50%, 0.5)')).toMatchInlineSnapshot('"rgba(0, 255, 0, 0.5)"');
  expect(parse('color(srgb 0 0.5 1)')).toMatchInlineSnapshot('"rgb(0, 128, 255)"');
  expect(parse('color(srgb 0 0.5 1 / 0.2)')).toMatchInlineSnapshot('"rgba(0, 128, 255, 0.2)"');
});

test(Dimension, () => {
  const parse = (input: string) => Dimension.parseCss(input)?.toCss();
  expect(parse('4px')).toMatchInlineSnapshot('"4px"');
  expect(parse('4.5px')).toMatchInlineSnapshot('"4.5px"');
  expect(parse('0vh')).toMatchInlineSnapshot('"0vh"');
  expect(parse('50%')).toMatchInlineSnapshot('"50%"');
  expect(parse('0')).toMatchInlineSnapshot('"0"');
  expect(parse('4')).toMatchInlineSnapshot('undefined');
  expect(parse('calc(4px)')).toMatchInlineSnapshot('undefined');
});

test(Border, () => {
  const parse = (input: string) => Border.parseCss(input)?.toCss();
  expect(parse('solid 1px red')).toMatchInlineSnapshot('"solid 1px rgb(255, 0, 0)"');
  expect(parse('1px solid red')).toMatchInlineSnapshot('"solid 1px rgb(255, 0, 0)"');
  expect(parse('red 1px solid')).toMatchInlineSnapshot('"solid 1px rgb(255, 0, 0)"');
  expect(parse('solid 1px red')).toMatchInlineSnapshot('"solid 1px rgb(255, 0, 0)"');
  expect(parse('1px red')).toMatchInlineSnapshot('"1px rgb(255, 0, 0)"');
  expect(parse('1px red')).toMatchInlineSnapshot('"1px rgb(255, 0, 0)"');
  expect(parse('solid red')).toMatchInlineSnapshot('"solid rgb(255, 0, 0)"');
  expect(parse('solid 1px')).toMatchInlineSnapshot('"solid 1px"');
});

test(BorderStyle, () => {
  const parse = (input: string) => BorderStyle.parseCss(input)?.toCss();
  expect(parse('solid')).toMatchInlineSnapshot('"solid"');
  expect(parse('dashed')).toMatchInlineSnapshot('"dashed"');
  expect(parse('invalid-line-style')).toMatchInlineSnapshot('undefined');
});
