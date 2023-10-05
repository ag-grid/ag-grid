import { MockInput } from './MockInput';
import { PreviewPanel } from './PreviewPanel';

export const ToggleButtonPreview = () => (
  <PreviewPanel
    description="Toggle buttons are used to enable pivoting in the columns tool panel, and in the chart settings menus."
    rows={[
      {
        title: 'Normal',
        label: 'Off',
        preview: <MockInput kind="toggle-button" state="unchecked" />,
      },
      {
        label: 'On',
        preview: <MockInput kind="toggle-button" state="checked" />,
      },
      {
        title: 'Focussed',
        label: 'Off',
        preview: <MockInput kind="toggle-button" state="unchecked" focus />,
      },
      {
        label: 'On',
        preview: <MockInput kind="toggle-button" state="checked" focus />,
      },
    ]}
  />
);
