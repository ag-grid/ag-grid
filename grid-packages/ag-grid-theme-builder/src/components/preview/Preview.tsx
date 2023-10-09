import styled from '@emotion/styled';
import { MockInput, MockInputProps } from './MockInput';

export const PreviewPanel = styled('div')`
  background-color: var(--ag-control-panel-background-color);
  width: 100%;
  height: 100%;
  padding: 50px;
`;

export const PreviewDescription = styled('div')`
  max-width: 400px;
  font-size: 1rem;
`;

export const PreviewTable = styled('div')`
  display: table;
  border-spacing: 30px;
`;

export const PreviewRow = styled('div')`
  display: table-row;
`;

export const PreviewSubtitle = styled('div')`
  font-weight: bold;
  display: table-row;
  font-size: 1rem;
`;

export const PreviewLabel = styled('div')`
  display: table-cell;
  vertical-align: middle;
  padding-left: 20px;
  font-size: 1rem;
`;

export const PreviewContent = styled('div')`
  display: table-cell;
  vertical-align: middle;
  pointer-events: none;
  text-align: center;
`;
export const PreviewContentTitle = styled('div')`
  display: table-cell;
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
`;

export const MockInputContent = (props: MockInputProps) => (
  <PreviewContent>
    <MockInput {...props} />
  </PreviewContent>
);
