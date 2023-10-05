import styled from '@emotion/styled';
import { Fragment, ReactElement } from 'react';

export type PreviewPanelProps = {
  description?: string;
  rows: Array<{ title?: string; label: string; preview: ReactElement }>;
};

export const PreviewPanel = ({ rows, description }: PreviewPanelProps) => (
  <Panel>
    {description && <Description>{description}</Description>}
    <Table>
      {rows.map(({ label, preview, title }, i) => (
        <Fragment key={i}>
          {title && <Subtitle>{title}</Subtitle>}
          <Row>
            <Label>{label}</Label>
            <Content>{preview}</Content>
          </Row>
        </Fragment>
      ))}
    </Table>
  </Panel>
);

const Panel = styled('div')`
  background-color: var(--ag-control-panel-background-color);
  width: 100%;
  height: 100%;
  padding: 50px;
`;

const Description = styled('div')`
  max-width: 400px;
  font-size: 1rem;
`;

const Table = styled('div')`
  display: table;
  border-spacing: 30px;
`;

const Row = styled('div')`
  display: table-row;
`;

const Subtitle = styled('div')`
  font-weight: bold;
  display: table-row;
  font-size: 1rem;
`;

const Label = styled('div')`
  display: table-cell;
  vertical-align: middle;
  padding-left: 20px;
  font-size: 1rem;
`;

const Content = styled('div')`
  display: table-cell;
  vertical-align: middle;
  pointer-events: none;
`;
