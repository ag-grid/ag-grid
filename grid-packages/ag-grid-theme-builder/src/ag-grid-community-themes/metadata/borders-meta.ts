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
});
