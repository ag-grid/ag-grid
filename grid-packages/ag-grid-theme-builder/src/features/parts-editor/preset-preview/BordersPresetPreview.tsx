import { styled } from '@mui/joy';
import { PresetModel } from '../../../model/PartModel';

type BordersPresetPreviewProps = {
  preset: PresetModel;
};

export const BordersPresetPreview = ({ preset }: BordersPresetPreviewProps) => {
  const params = preset.getFullPartParamValues();
  return (
    <Grid style={showIf(params.bordersOutside)}>
      <Row style={showIf(params.bordersOutside || params.bordersBelowHeaders)} />
      <Row style={showIf(params.bordersBelowHeaders)} />
      <Row style={showIf(params.bordersBetweenRows)} />
      <Row style={showIf(params.bordersBetweenRows)} />
      <Row style={showIf(params.bordersBetweenRows)} />
      <Columns>
        <Column style={showIf(params.bordersBetweenColumns)} />
        <Column style={showIf(params.bordersBetweenColumns)} />
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

const showIf = (value: boolean | undefined) => ({
  borderColor: value ? 'currentColor' : 'transparent',
});
