import {
  MockInputContent,
  PreviewLabel,
  PreviewPanel,
  PreviewRow,
  PreviewSubtitle,
  PreviewTable,
} from './Preview';

export const InputsPreview = () => (
  <PreviewPanel>
    <PreviewTable>
      <PreviewSubtitle>Valid</PreviewSubtitle>
      <PreviewRow>
        <PreviewLabel>Normal</PreviewLabel>
        <MockInputContent kind="text" />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>Disabled</PreviewLabel>
        <MockInputContent kind="text" disabled />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>Focussed</PreviewLabel>
        <MockInputContent kind="text" focussed />
      </PreviewRow>
      <PreviewSubtitle>Invalid</PreviewSubtitle>
      <PreviewRow>
        <PreviewLabel>Normal</PreviewLabel>
        <MockInputContent kind="text" invalid />
      </PreviewRow>
      <PreviewRow>
        <PreviewLabel>Focussed</PreviewLabel>
        <MockInputContent kind="text" invalid focussed />
      </PreviewRow>
    </PreviewTable>
  </PreviewPanel>
);
