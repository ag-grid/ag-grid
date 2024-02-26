import { styled } from '@mui/joy';
import { borderValueToCss } from '../../../ag-grid-community-themes/theme-utils';
import { PresetModel } from '../../../model/PartModel';

type BordersPresetPreviewProps = {
  preset: PresetModel;
};

export const BordersPresetPreview = ({ preset }: BordersPresetPreviewProps) => {
  const params = preset.getFullPartParamValues();
  return (
    <Grid style={{ border: borderValueToCss(params.wrapperBorder || false) }}>
      <Row style={{ borderBottom: borderValueToCss(params.headerBorder || false) }} />
      <Row style={{ borderBottom: borderValueToCss(params.headerBorder || false) }} />
      <Row style={{ borderBottom: borderValueToCss(params.rowBorder || false) }} />
      <Row style={{ borderBottom: borderValueToCss(params.rowBorder || false) }} />
      <Row style={{ borderBottom: borderValueToCss(params.rowBorder || false) }} />
      <Columns>
        <Column style={{ borderLeft: borderValueToCss(params.columnBorder || false) }} />
        <Column style={{ borderLeft: borderValueToCss(params.columnBorder || false) }} />
      </Columns>
    </Grid>
  );
};

const Grid = styled('div')`
  position: relative;
  width: 16px;
  height: 13px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  border-color: currentColor !important;
`;

const Row = styled('span')`
  position: relative;
  top: -1px;
  width: 100%;
  border-color: currentColor !important;
`;

const Columns = styled('div')`
  position: absolute;
  inset: -1px 0 1px 4px;
  display: flex;
  flex-direction: row;
  gap: 4px;
`;

const Column = styled('span')`
  height: 13px;
  border-color: currentColor !important;
`;
