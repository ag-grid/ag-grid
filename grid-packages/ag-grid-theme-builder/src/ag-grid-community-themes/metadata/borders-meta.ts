import { definePartMeta } from './metadata-types';

export const bordersMeta = definePartMeta({
  partId: 'borders',
  presets: [
    {
      presetId: 'horizontal',
      paramValues: { wrapperBorder: false, sidePanelBorder: false },
    },
    {
      presetId: 'default',
      paramValues: {},
      isDefault: true,
    },
    {
      presetId: 'full',
      paramValues: { columnBorder: true },
    },
  ],
  params: [
    {
      property: 'wrapperBorder',
      type: 'border',
      docs: 'Borders around the outside of the grid',
      defaultValue: true,
    },
    {
      property: 'headerBorder',
      type: 'border',
      docs: 'Borders between and below headers, including ordinary header rows and components that render within header rows such as the floating filter and advanced filter',
      defaultValue: true,
    },
    {
      property: 'footerBorder',
      type: 'border',
      docs: 'Horizontal borders above footer components like the pagination and status bars',
      defaultValue: true,
    },
    {
      property: 'columnBorder',
      type: 'border',
      docs: 'Vertical borders separating columns',
      defaultValue: false,
    },
    {
      property: 'pinnedColumnBorder',
      type: 'border',
      docs: 'Borders between the grid and columns that are pinned to the left or right',
      defaultValue: true,
    },
    {
      property: 'pinnedRowBorder',
      type: 'border',
      docs: 'Borders between the grid and rows that are pinned to the top or bottom',
      defaultValue: true,
    },
    {
      property: 'sidePanelBorder',
      type: 'border',
      docs: 'Borders between the grid and side panels including the column and filter tool bars, and chart settings',
      defaultValue: true,
    },
  ],
});
