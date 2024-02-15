import { definePartMeta } from './metadata-types';

export const quartzIconsMeta = definePartMeta({
  partId: 'quartz-icons',
  presets: [
    {
      presetId: 'light',
      paramValues: { iconStrokeWidth: '1px' },
    },
    {
      presetId: 'regular',
      paramValues: {},
      isDefault: true,
    },
    {
      presetId: 'bold',
      paramValues: { iconStrokeWidth: '2px' },
    },
  ],
  params: [
    {
      property: 'iconSize',
      type: 'length',
      docs: 'Width & height of the icon image.',
      defaultValue: '16px',
      min: 8,
      max: 32,
      step: 1,
    },
    {
      property: 'iconStrokeWidth',
      type: 'length',
      docs: 'Width in pixels of lines making up the icon.',
      defaultValue: '1.5px',
      min: 0.5,
      max: 4,
      step: 0.1,
    },
  ],
  cssFiles: ['quartz-icons.css'],
  iconsFile: 'quartz-icons-fragments',
});
