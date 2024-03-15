import styled from '@emotion/styled';
import { kebabCaseToTitleCase } from 'model/utils';
import { Fragment } from 'react';
import { PreviewContent, PreviewLabel, PreviewPanel, PreviewRow, PreviewTable } from './Preview';

const iconNames = [
  'aggregation',
  'arrows',
  'asc',
  'cancel',
  'chart',
  'color-picker',
  'columns',
  'contracted',
  'copy',
  'cross',
  'cut',
  'desc',
  'down',
  'excel',
  'expanded',
  'eye-slash',
  'eye',
  'filter',
  'first',
  'grip',
  'group',
  'last',
  'left',
  'linked',
  'loading',
  'maximize',
  'menu',
  'minimize',
  'minus',
  'next',
  'none',
  'not-allowed',
  'paste',
  'pin',
  'pivot',
  'plus',
  'previous',
  'right',
  'save',
  'tick',
  'tree-closed',
  'tree-indeterminate',
  'tree-open',
  'unlinked',
  'up',
];

export const IconsPreview = () => (
  <PreviewPanel>
    <PreviewTable>
      {subdivideArray(iconNames, 5).map((row, i) => (
        <PreviewRow key={i}>
          {row.map((iconName, colIndex) => (
            <Fragment key={iconName}>
              {colIndex > 0 && <ColumnSpacer />}
              <PreviewLabel>{kebabCaseToTitleCase(iconName)}</PreviewLabel>
              <PreviewContent>
                <span className={`ag-icon ag-icon-${iconName}`}></span>
              </PreviewContent>
            </Fragment>
          ))}
        </PreviewRow>
      ))}
    </PreviewTable>
  </PreviewPanel>
);

const ColumnSpacer = styled(PreviewContent)`
  width: 20px;
`;

function subdivideArray<T>(input: T[], size: number): T[][] {
  const result: T[][] = [];
  const sections = Math.ceil(input.length / size);
  for (let i = 0; i < sections; i++) {
    result.push(input.slice(i * size, i * size + size));
  }
  return result;
}
