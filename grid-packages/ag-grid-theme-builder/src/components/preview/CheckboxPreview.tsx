import { MockInput } from './MockInput';
import { PreviewPanel } from './PreviewPanel';

export const CheckboxPreview = () => (
  <PreviewPanel
    rows={[
      {
        title: 'Normal',
        label: 'Off',
        preview: <MockInput kind="checkbox" state="unchecked" />,
      },
      {
        label: 'On',
        preview: <MockInput kind="checkbox" state="checked" />,
      },
      {
        label: 'Indeterminate',
        preview: <MockInput kind="checkbox" state="indeterminate" />,
      },
      {
        title: 'Disabled',
        label: 'Off',
        preview: <MockInput kind="checkbox" state="unchecked" disabled />,
      },
      {
        label: 'On',
        preview: <MockInput kind="checkbox" state="checked" disabled />,
      },
      {
        label: 'Indeterminate',
        preview: <MockInput kind="checkbox" state="indeterminate" disabled />,
      },
      {
        title: 'Focussed',
        label: 'Off',
        preview: <MockInput kind="checkbox" state="unchecked" focus />,
      },
      {
        label: 'On',
        preview: <MockInput kind="checkbox" state="checked" focus />,
      },
      {
        label: 'Indeterminate',
        preview: <MockInput kind="checkbox" state="indeterminate" focus />,
      },
    ]}
  />
);
