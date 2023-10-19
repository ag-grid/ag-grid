import { expect, test } from 'vitest';
import { renderCss } from './render';
import { Value, ValueType } from './values';
import { Border } from './values/Border';
import { BorderStyle } from './values/BorderStyle';
import { Color } from './values/Color';
import { Dimension } from './values/Dimension';
import { Display } from './values/Display';
test(renderCss, () => {
  const oneOfEachType: Record<ValueType, Value> = {
    color: new Color(1, 0, 0.5, 1),
    dimension: new Dimension(8, 'em'),
    border: new Border(new BorderStyle('solid'), new Dimension(1, 'px'), new Color(1, 0, 0.5, 1)),
    borderStyle: new BorderStyle('dotted'),
    display: new Display('none'),
  };
  expect(
    renderCss({
      themeName: 'my-theme',
      values: oneOfEachType,
    }),
  ).toMatchInlineSnapshot(`
    ".my-theme {
        color: rgb(255, 0, 128);
        dimension: 8em;
        border: solid 1px rgb(255, 0, 128);
        borderStyle: dotted;
        display: none;
    }"
  `);
});
