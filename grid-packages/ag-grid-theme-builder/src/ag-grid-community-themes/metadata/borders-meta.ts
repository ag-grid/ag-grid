import { definePartMeta } from './metadata-types';

export const bordersMeta = definePartMeta({
  partId: 'borders',
  presets: [
    {
      presetId: 'horizontal',
      paramValues: { bordersOutside: false, bordersSidePanels: false },
    },
    {
      presetId: 'default',
      paramValues: {},
      isDefault: true,
    },
    {
      presetId: 'full',
      paramValues: { bordersBetweenColumns: true },
    },
  ],
  params: [
    {
      property: 'bordersOutside',
      type: 'boolean',
      docs: 'Borders around the outside of the grid',
      defaultValue: true,
    },
    {
      property: 'bordersBelowHeaders',
      type: 'boolean',
      docs: 'Borders between and below headers, including ordinary header rows and components that render within header rows such as the floating filter and advanced filter',
      defaultValue: true,
    },
    {
      property: 'bordersAboveFooters',
      type: 'boolean',
      docs: 'Horizontal borders above footer components like the pagination and status bars',
      defaultValue: true,
    },
    {
      property: 'bordersBetweenRows',
      type: 'boolean',
      docs: 'Horizontal borders separating rows',
      defaultValue: true,
    },
    {
      property: 'bordersBetweenColumns',
      type: 'boolean',
      docs: 'Vertical borders separating columns',
      defaultValue: false,
    },
    {
      property: 'bordersPinnedRows',
      type: 'boolean',
      docs: 'Borders between the grid and rows that are pinned to the top or bottom',
      defaultValue: true,
    },
    {
      property: 'bordersPinnedColumns',
      type: 'boolean',
      docs: 'Borders between the grid and columns that are pinned to the left or right',
      defaultValue: true,
    },
    {
      property: 'bordersSidePanels',
      type: 'boolean',
      docs: 'Borders between the grid and side panels including the column and filter tool bars, and chart settings',
      defaultValue: true,
    },
  ],
  conditionalCssFiles: {
    bordersAboveFooters: 'borders-above-footers.css',
    bordersBelowHeaders: 'borders-below-headers.css',
    bordersBetweenColumns: 'borders-between-columns.css',
    bordersBetweenRows: 'borders-between-rows.css',
    bordersOutside: 'borders-outside.css',
    bordersPinnedColumns: 'borders-pinned-columns.css',
    bordersPinnedRows: 'borders-pinned-rows.css',
    bordersSidePanels: 'borders-side-panels.css',
  },
});
