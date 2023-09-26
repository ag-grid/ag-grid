import { expect, test } from 'vitest';
import { Feature } from './features';
import { renderCSS } from './render';
import { Theme } from './themes';
import { color, dimension } from './values';

const testTheme: Theme = {
  name: 'ag-theme-derived',
  addedVariables: [
    '--plain-variable',
    '--unused-variable',
    '--blend-source',
    '--blend-destination-should-apply-alpha-0.9',
    '--blend-destination-should-overlay-twice',
    '--variable-in-theme-but-not-feature',
    '--provided-value-should-override-blend',
    '--blend-destination-should-copy-value',
  ],
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
    addedVariables: [
      '--variable-in-base-theme',
      '--blend-destination-should-work-in-base',
      '--blend-destination-should-be-overridden-in-base',
    ],
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
  variableNames: [
    '--plain-variable',
    '--blend-source',
    '--blend-destination-should-apply-alpha-0.9',
    '--variable-in-feature-but-not-theme',
    '--variable-in-base-theme',
    '--blend-destination-should-be-overridden-in-base',
    '--provided-value-should-override-blend',
    '--blend-destination-should-overlay-twice',
    '--blend-destination-should-copy-value',
  ],
};

test(renderCSS, () => {
  expect(
    renderCSS({
      theme: testTheme,
      values: {
        '--plain-variable': dimension(4, 'px'),
        '--blend-source': color('#aaaaaa80'),
        '--provided-value-should-override-blend': color('#bbb'),
        '--variable-not-in-any-theme-or-feature': color('#aaa'),
        '--variable-in-theme-but-not-feature': color('#aaa'),
        '--variable-in-feature-but-not-theme': color('#aaa'),
        '--variable-in-base-theme': color('#aaa'),
      },
      features: [testFeature],
    }),
  ).toMatchInlineSnapshot(`
      ".ag-theme-derived {
          --plain-variable: 4px;
          --blend-source: #aaaaaa80;
          --variable-in-base-theme: #aaaaaa;
          --provided-value-should-override-blend: #bbbbbb;
          --blend-destination-should-copy-value: #aaaaaa80;
          --blend-destination-should-apply-alpha-0.9: #aaaaaa73;
          --blend-destination-should-overlay-twice: #aaaaaac0;
          --blend-destination-should-be-overridden-in-base: #aaaaaa80;
          --blend-destination-should-work-in-base: #aaaaaa0d;
      }"
    `);
});
