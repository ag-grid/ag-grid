import { expect, test } from 'vitest';
import { VarColor } from './VarColor';

test.each([
  ['var(--ag-foreground-color)', new VarColor('--ag-foreground-color', 1)],
  [' VAR( --ag-foreground-color ) ', new VarColor('--ag-foreground-color', 1)],
  [
    'color-mix(in srgb, transparent, var(--ag-foreground-color) 30.5%)',
    new VarColor('--ag-foreground-color', 0.305),
  ],
  [
    ' color-MIX( in  SRGB   ,  transparent   ,   var( --ag-foreground-color  )  75% ) ',
    new VarColor('--ag-foreground-color', 0.75),
  ],
  // invalid: var as left hand color
  ['color-mix(in srgb, var(--ag-background-color), var(--ag-foreground-color) 75%)', null],
  // invalid: named color as left hand color
  ['color-mix(in srgb, blue, var(--ag-foreground-color) 75%)', null],
  // invalid: mix amount not a percentage
  ['color-mix(in srgb, transparent, var(--ag-foreground-color) 0.75)', null],
])('parseCss("%s")', (input, expected) => {
  expect(VarColor.parseCss(input)).toEqual(expected);
});
