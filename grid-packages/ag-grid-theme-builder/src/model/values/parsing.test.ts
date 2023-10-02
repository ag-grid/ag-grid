import { expect, test } from 'vitest';
import { border, parseCssBorder, splitCssList } from './border';
import { borderStyle, parseCssBorderStyle } from './borderStyle';
import { color, parseCssColor } from './color';
import { dimension, parseCssDimension } from './dimension';

type TestDef = [parser: (value: string) => unknown, [input: string, expectedOutput: unknown][]];

const testDefs: TestDef[] = [
  [
    parseCssColor,
    [
      ['#aaBBcc', color('#aabbcc')],
      ['#abC', color('#aabbcc')],
      ['#AAbbcc80', color('#aabbcc80')],
      ['#abC8', color('#aabbcc88')],
      ['rgb(0, 255, 0)', color('#00ff00')],
      ['rgba(0, 255, 0, 0.5)', color('#00ff0080')],
      ['hsl(120, 100%, 50%)', color('#00ff00')],
      ['hsla(120, 100%, 50%, 0.5)', color('#00ff0080')],
    ],
  ],
  [
    parseCssDimension,
    [
      ['4px', dimension(4, 'px')],
      ['4.5px', dimension(4.5, 'px')],
      ['0vh', dimension(0, 'vh')],
      ['50%', dimension(50, '%')],
      ['calc(4px*4)', dimension(16, 'px')],
      ['calc( 4px * 4 )', dimension(16, 'px')],
      ['calc(3vh)', dimension(3, 'vh')],
      ['calc(2% * 10)', dimension(20, '%')],
      ['calc(5em * (1em + 3em))', dimension(20, 'em')],
      ['calc(calc(6px * 2) + 16px)', dimension(28, 'px')],
      ['CALC(CALC(6px * 2) + 16px)', dimension(28, 'px')],
      ['0', dimension(0, '')], // valid - zero without unit
      ['calc(0)', dimension(0, '')], // valid - zero without unit
      ['4', null], // invalid - nonzero without unit
      ['calc(4)', null], // invalid - nonzero without unit
      ['calc(3vh+5px)', null], // invalid - mixed units
    ],
  ],
  [
    splitCssList,
    [
      ['a', ['a']],
      ['a b', ['a', 'b']],
      ['  a   b  ', ['a', 'b']],
      [' alpha  beta ', ['alpha', 'beta']],
      ['alpha beta charlie', ['alpha', 'beta', 'charlie']],
      ['calc( var(--foo) * (3 + 5) )', ['calc( var(--foo) * (3 + 5) )']],
      ['a calc( var(--foo) * (3 + 5) ) c', ['a', 'calc( var(--foo) * (3 + 5) )', 'c']],
      ['calc( var(--foo) ) calc( var(--bar) )', ['calc( var(--foo) )', 'calc( var(--bar) )']],
      ['(3 + 5) ( 4 ) foo()', ['(3 + 5)', '( 4 )', 'foo()']],
    ],
  ],
  [
    parseCssBorder,
    [
      ['solid 1px red', border('solid', dimension(1, 'px'), color('#f00'))],
      ['1px solid red', border('solid', dimension(1, 'px'), color('#f00'))],
      ['red 1px solid', border('solid', dimension(1, 'px'), color('#f00'))],
      ['solid 1px red', border('solid', dimension(1, 'px'), color('#f00'))],
      ['1px red', border(null, dimension(1, 'px'), color('#f00'))],
      ['1px red', border(null, dimension(1, 'px'), color('#f00'))],
      ['solid red', border('solid', null, color('#f00'))],
      ['solid 1px', border('solid', dimension(1, 'px'), null)],
      ['solid calc(1px) red', border('solid', dimension(1, 'px'), color('#f00'))],
      ['solid calc(2px * 4) red', border('solid', dimension(8, 'px'), color('#f00'))],
      ['solid calc((2px + 4px) * 3) red', border('solid', dimension(18, 'px'), color('#f00'))],
    ],
  ],
  [
    parseCssBorderStyle,
    [
      ['solid', borderStyle('solid')],
      ['dashed', borderStyle('dashed')],
      ['invalid-line-type', null],
    ],
  ],
];

testDefs.forEach(([f, args]) =>
  test.each(args)(`${f.name}("%s")`, (input, expected) => {
    expect(f(input)).toEqual(expected);
  }),
);
