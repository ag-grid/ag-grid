import { definePartMeta } from './metadata-types';

export const colorsMeta = definePartMeta({
  partId: 'colors',
  presets: [
    {
      presetId: 'light',
      paramValues: {},
      isDefault: true,
    },
    {
      presetId: 'dark',
      paramValues: { backgroundColor: '#1f2836', foregroundColor: '#FFF' },
    },
  ],
  params: [
    {
      property: 'backgroundColor',
      type: 'color',
      docs: 'Background colour of the grid. The default is white - if you override this, ensure that there is enough contrast between the foreground and background.',
      defaultValue: '#FFF',
    },
    {
      property: 'foregroundColor',
      type: 'color',
      docs: 'Foreground colour of the grid, and default text colour. The default is black - if you override this, ensure that there is enough contrast between the foreground and background.',
      defaultValue: '#181d1f',
    },
    {
      property: 'accentColor',
      type: 'color',
      docs: "The 'brand colour' for the grid, used wherever a non-neutral colour is required. Selections, focus outlines and checkboxes use the accent colour by default.",
      defaultValue: '#2196f3',
    },
    {
      property: 'borderColor',
      type: 'color',
      docs: 'Default colour for borders.',
      defaultValue: { helper: 'transparentForeground', arg: 0.15 },
    },
    {
      property: 'chromeBackgroundColor',
      type: 'color',
      docs: 'Background colour for non-data areas of the grid. Headers, tool panels and menus use this colour by default.',
      defaultValue: { helper: 'transparentForeground', arg: 0.02 },
    },
    {
      property: 'dataColor',
      type: 'color',
      docs: 'Colour of text in grid cells.',
      defaultValue: { helper: 'ref', arg: 'foregroundColor' },
    },
    {
      property: 'rowBorderColor',
      type: 'color',
      docs: 'Colour of the border between grid rows.',
      defaultValue: { helper: 'ref', arg: 'borderColor' },
    },
  ],
  cssFiles: ['colors.css'],
});
