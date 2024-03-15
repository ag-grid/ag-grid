import { CheckboxPreview } from 'components/preview/CheckboxPreview';
import { Feature } from '.';

export const checkboxesFeature: Feature = {
  name: 'checkboxes',
  displayName: 'Checkbox Controls',
  commonVariablePrefix: '--ag-toggle-button',
  variableNames: [
    '--ag-checkbox-background-color',
    '--ag-checkbox-border-radius',
    '--ag-checkbox-checked-color',
    '--ag-checkbox-indeterminate-color',
    '--ag-checkbox-unchecked-color',
    // TODO add '--ag-input-focus-box-shadow' when shadow editor ready
  ],
  previewComponent: CheckboxPreview,
};
