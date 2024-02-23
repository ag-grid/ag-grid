import { styled } from '@mui/joy';
import { PresetModel } from '../../../model/PartModel';

type BordersPresetPreviewProps = {
  preset: PresetModel;
};

export const BordersPresetPreview = ({ preset }: BordersPresetPreviewProps) => {
  const params = preset.getFullPartParamValues();
  return (
    <Grid style={showIf(params.wrapperBorder)}>
      <Row style={showIf(params.wrapperBorder || params.headerBorder)} />
      <Row style={showIf(params.headerBorder)} />
      <Row style={showIf(params.rowBorderColor)} />
      <Row style={showIf(params.rowBorderColor)} />
      <Row style={showIf(params.rowBorderColor)} />
      <Columns>
        <Column style={showIf(params.columnBorder)} />
        <Column style={showIf(params.columnBorder)} />
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
  border-left: solid 1px;
  border-right: solid 1px;
`;

const Row = styled('span')`
  width: 100%;
  border-bottom: solid 1px;
`;

const Columns = styled('div')`
  position: absolute;
  inset: 0 0 0 4px;
  display: flex;
  flex-direction: row;
  gap: 4px;
`;

const Column = styled('span')`
  height: 13px;
  border-left: solid 1px;
`;

const showIf = (value: boolean | undefined | string) => ({
  borderColor: value ? 'currentColor' : 'transparent',
});
