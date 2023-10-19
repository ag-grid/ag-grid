import { ToggleButtonPreview } from 'components/preview/ToggleButtonPreview';
import { Feature } from '.';

export const toggleButtonsFeature: Feature = {
  name: 'toggleButtons',
  displayName: 'Toggle Button Controls',
  commonVariablePrefix: '--ag-toggle-button',
  variableNames: [
    '--ag-toggle-button-width',
    '--ag-toggle-button-height',
    '--ag-toggle-button-border-width',
    '--ag-toggle-button-off-background-color',
    '--ag-toggle-button-off-border-color',
    '--ag-toggle-button-on-background-color',
    '--ag-toggle-button-on-border-color',
    '--ag-toggle-button-switch-background-color',
    '--ag-toggle-button-switch-border-color',
    // TODO add '--ag-input-focus-box-shadow' when shadow editor ready
  ],
  previewComponent: ToggleButtonPreview,
};
