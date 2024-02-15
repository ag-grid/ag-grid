import { styled } from '@mui/joy';
import { PresetModel } from '../../../model/PartModel';

type ColorsPresetPreviewProps = {
  preset: PresetModel;
};

export const ColorsPresetPreview = ({ preset }: ColorsPresetPreviewProps) => {
  const params = preset.getFullPartParamValues();
  return (
    <Background style={{ backgroundColor: params.backgroundColor }}>
      <Foreground style={{ color: params.foregroundColor }} />
    </Background>
  );
};

const Background = styled('div')`
  width: 16px;
  height: 16px;
  position: relative;
  border-radius: 2px;
  box-shadow: 0 0 8px #999;
`;

const Foreground = styled('div')`
  position: absolute;
  inset: 2px;
  border: solid 1.5px;
  border-radius: 100%;
`;
