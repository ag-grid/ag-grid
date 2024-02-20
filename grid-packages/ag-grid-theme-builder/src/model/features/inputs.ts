import { InputsPreview } from 'components/preview/InputsPreview';
import { Feature } from '.';

export const inputsFeature: Feature = {
  name: 'inputs',
  displayName: 'Inputs',
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
  previewComponent: InputsPreview,
};
