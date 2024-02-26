import { IconsPreview } from 'components/preview/IconsPreview';
import { Feature } from '.';

export const iconsFeature: Feature = {
  name: 'icons',
  displayName: 'Icons',
  commonVariablePrefix: '--ag-toggle-button',
  variableNames: [
    '--ag-borders-input',
    '--ag-input-border-color',
    '--ag-input-disabled-background-color',
    '--ag-input-disabled-border-color',
    '--ag-input-focus-border-color',
    '--ag-borders-input-invalid',
    '--ag-invalid-color',
    // TODO add '--ag-input-focus-box-shadow' when shadow editor ready
  ],
  previewComponent: IconsPreview,
};
