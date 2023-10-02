import { expect, test } from 'vitest';
import { Feature } from './features';
import { renderCSS, renderedThemeToCss } from './render';
import { Theme } from './themes';
import { Value, ValueType } from './values';
import { border } from './values/border';
import { borderStyle } from './values/borderStyle';
import { color } from './values/color';
import { dimension } from './values/dimension';

const testTheme: Theme = {
  name: 'ag-theme-derived',
  colorBlends: [
    {
      destination: '--blend-destination-should-copy-value',
      source: '--blend-source',
    },
    {
      destination: '--blend-destination-should-apply-alpha-0.9',
      source: '--blend-source',
      alpha: 0.9,
    },
    {
      destination: '--blend-destination-should-overlay-twice',
      source: '--blend-source',
      selfOverlay: 2,
    },
    {
      destination: '--provided-value-should-override-blend',
      source: '--blend-source',
    },
    {
      destination: '--blend-destination-should-be-overridden-in-base',
      source: '--blend-source',
      alpha: 1,
    },
  ],
  extends: {
    name: 'base',
    extends: null,
    colorBlends: [
      {
        destination: '--blend-destination-should-work-in-base',
        source: '--blend-source',
        alpha: 0.1,
      },
      {
        destination: '--blend-destination-should-be-overridden-in-base',
        source: '--blend-source',
        alpha: 0.2,
      },
    ],
  },
};
const testFeature: Feature = {
  name: 'source-destination',
  displayName: 'Source Destination',
  variableNames: [],
};

test(renderCSS, () => {
  expect(
    renderCSS({
      theme: testTheme,
      values: {
        '--plain-variable': dimension(4, 'px'),
        '--blend-source': color('#aaaaaa80'),
        '--provided-value-should-override-blend': color('#bbb'),
        '--variable-not-in-any-theme': color('#aaa'),
        '--variable-in-base-theme': color('#aaa'),
      },
      features: [testFeature],
    }),
  ).toMatchInlineSnapshot(`
      ".ag-theme-derived {
          --plain-variable: 4px;
          --blend-source: #aaaaaa80;
          --provided-value-should-override-blend: #bbbbbb;
          --variable-in-base-theme: #aaaaaa;
          --blend-destination-should-copy-value: #aaaaaa80;
          --blend-destination-should-apply-alpha-0.9: #aaaaaa73;
          --blend-destination-should-overlay-twice: #aaaaaac0;
          --blend-destination-should-be-overridden-in-base: #aaaaaa80;
          --blend-destination-should-work-in-base: #aaaaaa0d;
      }"
    `);
});

test(renderedThemeToCss, () => {
  const oneOfEachType: Record<ValueType, Value> = {
    color: color('#f08'),
    dimension: dimension(8, 'em'),
    border: border('solid', dimension(1, 'px'), color('#fff')),
    borderStyle: borderStyle('double'),
  };
  expect(
    renderedThemeToCss({
      themeName: 'my-theme',
      values: oneOfEachType,
    }),
  ).toMatchInlineSnapshot(`
    ".my-theme {
        color: #ff0088;
        dimension: 8em;
        border: solid 1px #ffffff;
        borderStyle: double;
    }"
  `);
});
