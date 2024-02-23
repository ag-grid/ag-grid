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
  params: [],
});
