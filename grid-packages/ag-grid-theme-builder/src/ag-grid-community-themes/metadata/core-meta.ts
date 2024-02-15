import { definePartMeta } from './metadata-types';

export const coreMeta = definePartMeta({
  partId: 'core',
  params: [
    {
      property: 'rangeSelectionBorderColor',
      type: 'color',
      docs: 'The color used for borders around range selections. The selection background defaults to a semi-transparent version of this colour.',
      defaultValue: { helper: 'ref', arg: 'accentColor' },
    },
    {
      property: 'rangeSelectionBorderStyle',
      type: 'borderStyle',
      docs: 'Style of the border around range selections.',
      defaultValue: 'solid',
    },
    {
      property: 'rangeSelectionBackgroundColor',
      type: 'color',
      docs: 'Background colour of selected cell ranges. Choosing a semi-transparent colour ensure that multiple overlapping ranges look correct.',
      defaultValue: { helper: 'transparentAccent', arg: 0.2 },
    },
    {
      property: 'rangeSelectionHighlightColor',
      type: 'color',
      docs: 'Background colour to briefly apply to a cell range when the user copies from or pastes into it.',
      defaultValue: { helper: 'transparentAccent', arg: 0.5 },
    },
    {
      property: 'rowHoverColor',
      type: 'color',
      docs: 'Background color when hovering over rows in the grid and in dropdown menus. Set to `transparent` to disable the hover effect. Note: if you want a rollover on one but not the other, use CSS selectors instead of this property.',
      defaultValue: { helper: 'transparentAccent', arg: 0.12 },
    },
    {
      property: 'columnHoverColor',
      type: 'color',
      docs: 'Background color when hovering over columns in the grid',
      defaultValue: { helper: 'transparentAccent', arg: 0.05 },
    },
    {
      property: 'selectedRowBackgroundColor',
      type: 'color',
      docs: 'Background color of selected rows in the grid and in dropdown menus.',
      defaultValue: { helper: 'transparentAccent', arg: 0.08 },
    },
    {
      property: 'oddRowBackgroundColor',
      type: 'color',
      docs: 'Background colour applied to every other row',
      defaultValue: { helper: 'ref', arg: 'backgroundColor' },
    },
    {
      property: 'borderRadius',
      type: 'length',
      docs: 'Border radius applied to many elements such as menus, dialogs and form widgets.',
      defaultValue: '4px',
      min: 0,
      max: 20,
      step: 1,
    },
    {
      property: 'wrapperBorderRadius',
      type: 'length',
      defaultValue: '8px',
      min: 0,
      max: 20,
      step: 1,
      docs: 'Border radius applied to the outermost container around the grid.',
    },
    {
      property: 'rowGroupIndentSize',
      type: 'length',
      docs: 'The indentation applied to each level of row grouping - deep rows are indented by a multiple of this value.',
      defaultValue: { helper: 'calc', arg: 'cellWidgetSpacing + iconSize' },
      min: 0,
      max: 50,
      step: 1,
    },
  ],
  cssFiles: ['reset.css', 'grid-borders.css', 'grid-layout.css'],
});
