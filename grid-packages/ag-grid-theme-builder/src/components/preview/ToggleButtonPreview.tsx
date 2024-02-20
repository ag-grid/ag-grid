import {
  MockInputContent,
  PreviewDescription,
  PreviewLabel,
  PreviewPanel,
  PreviewRow,
  PreviewSubtitle,
  PreviewTable,
} from './Preview';

export const ToggleButtonPreview = () => (
  <PreviewPanel>
    <PreviewDescription>
      Toggle buttons are used to enable pivoting in the columns tool panel, and in the chart
      settings menus
    </PreviewDescription>
    <PreviewTable>
      <PreviewSubtitle>Normal</PreviewSubtitle>
      <PreviewRow>
        <PreviewLabel>Off</PreviewLabel>
        <MockInputContent kind="toggle-button" state="unchecked" />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>On</PreviewLabel>
        <MockInputContent kind="toggle-button" state="checked" />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>Indeterminate</PreviewLabel>
        <MockInputContent kind="toggle-button" state="indeterminate" />
      </PreviewRow>
      <PreviewSubtitle>Disabled</PreviewSubtitle>
      <PreviewRow>
        <PreviewLabel>Off</PreviewLabel>
        <MockInputContent kind="toggle-button" state="unchecked" disabled />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>On</PreviewLabel>
        <MockInputContent kind="toggle-button" state="checked" disabled />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>Indeterminate</PreviewLabel>
        <MockInputContent kind="toggle-button" state="indeterminate" disabled />
      </PreviewRow>
      <PreviewSubtitle>Focussed / active</PreviewSubtitle>
      <PreviewRow>
        <PreviewLabel>Off</PreviewLabel>
        <MockInputContent kind="toggle-button" state="unchecked" focussed />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>On</PreviewLabel>
        <MockInputContent kind="toggle-button" state="checked" focussed />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>Indeterminate</PreviewLabel>
        <MockInputContent kind="toggle-button" state="indeterminate" focussed />
      </PreviewRow>
    </PreviewTable>
  </PreviewPanel>
);
