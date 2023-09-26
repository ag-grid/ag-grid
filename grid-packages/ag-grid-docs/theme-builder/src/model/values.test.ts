import { expect, test } from 'vitest';
import {
  border,
  color,
  colorWithAlpha,
  colorWithSelfOverlay,
  dimension,
  parseCssBorder,
  parseCssColor,
  parseCssDimension,
} from './values';

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

test(parseCssColor, () => {
  expect(parseCssColor('#aaBBcc')).toEqual(color('#aabbcc'));
  expect(parseCssColor('#abC')).toEqual(color('#aabbcc'));
  expect(parseCssColor('#AAbbcc80')).toEqual(color('#aabbcc80'));
  expect(parseCssColor('#abC8')).toEqual(color('#aabbcc88'));

  expect(parseCssColor('rgb(0, 255, 0)')).toEqual(color('#00ff00'));
  expect(parseCssColor('rgba(0, 255, 0, 0.5)')).toEqual(color('#00ff0080'));
});

test(parseCssDimension, () => {
  expect(parseCssDimension('4px')).toEqual(dimension(4, 'px'));
  expect(parseCssDimension('4.5px')).toEqual(dimension(4.5, 'px'));
  expect(parseCssDimension('0vh')).toEqual(dimension(0, 'vh'));
});

test(parseCssBorder, () => {
  expect(parseCssBorder('solid 1px red')).toEqual(
    border('solid', dimension(1, 'px'), color('#f00')),
  );
  expect(parseCssBorder('1px solid red')).toEqual(
    border('solid', dimension(1, 'px'), color('#f00')),
  );
  expect(parseCssBorder('red 1px solid')).toEqual(
    border('solid', dimension(1, 'px'), color('#f00')),
  );
  expect(parseCssBorder('1px red')).toEqual(border(null, dimension(1, 'px'), color('#f00')));
  expect(parseCssBorder('1px red')).toEqual(border(null, dimension(1, 'px'), color('#f00')));
  expect(parseCssBorder('solid red')).toEqual(border('solid', null, color('#f00')));
  expect(parseCssBorder('solid 1px')).toEqual(border('solid', dimension(1, 'px'), null));
});
