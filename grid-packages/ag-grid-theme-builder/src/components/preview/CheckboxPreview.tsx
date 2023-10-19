import {
  MockInputContent,
  PreviewContentTitle,
  PreviewLabel,
  PreviewPanel,
  PreviewRow,
  PreviewSubtitle,
  PreviewTable,
} from './Preview';

export const CheckboxPreview = () => (
  <PreviewPanel>
    <PreviewTable>
      <PreviewRow>
        <PreviewLabel />
        <PreviewContentTitle>Checkbox style</PreviewContentTitle>
        <PreviewContentTitle>Radio button style</PreviewContentTitle>
      </PreviewRow>
      <PreviewSubtitle>Normal</PreviewSubtitle>
      <PreviewRow>
        <PreviewLabel>Off</PreviewLabel>
        <MockInputContent kind="checkbox" state="unchecked" />
        <MockInputContent kind="radio-button" state="unchecked" />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>On</PreviewLabel>
        <MockInputContent kind="checkbox" state="checked" />
        <MockInputContent kind="radio-button" state="checked" />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>Indeterminate</PreviewLabel>
        <MockInputContent kind="checkbox" state="indeterminate" />
        <MockInputContent kind="radio-button" state="indeterminate" />
      </PreviewRow>
      <PreviewSubtitle>Disabled</PreviewSubtitle>
      <PreviewRow>
        <PreviewLabel>Off</PreviewLabel>
        <MockInputContent kind="checkbox" state="unchecked" disabled />
        <MockInputContent kind="radio-button" state="unchecked" disabled />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>On</PreviewLabel>
        <MockInputContent kind="checkbox" state="checked" disabled />
        <MockInputContent kind="radio-button" state="checked" disabled />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>Indeterminate</PreviewLabel>
        <MockInputContent kind="checkbox" state="indeterminate" disabled />
        <MockInputContent kind="radio-button" state="indeterminate" disabled />
      </PreviewRow>
      <PreviewSubtitle>Focussed / active</PreviewSubtitle>
      <PreviewRow>
        <PreviewLabel>Off</PreviewLabel>
        <MockInputContent kind="checkbox" state="unchecked" focussed />
        <MockInputContent kind="radio-button" state="unchecked" focussed />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>On</PreviewLabel>
        <MockInputContent kind="checkbox" state="checked" focussed />
        <MockInputContent kind="radio-button" state="checked" focussed />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>Indeterminate</PreviewLabel>
        <MockInputContent kind="checkbox" state="indeterminate" focussed />
        <MockInputContent kind="radio-button" state="indeterminate" focussed />
      </PreviewRow>
    </PreviewTable>
  </PreviewPanel>
);
