import { FC, ReactElement } from 'react';
import { PartModel, PresetModel } from '../../../model/PartModel';
import { BordersPresetPreview } from './BordersPresetPreview';
import { ColorsPresetPreview } from './ColorsPresetPreview';
import { QuartzIconsPresetPreview } from './QuartzIconsPresetPreview';

export type PresetPreviewProps = {
  part: PartModel;
  preset: PresetModel;
};

const previewComponentByType: Record<string, FC<PresetPreviewProps> | null> = {
  colors: ColorsPresetPreview,
  borders: BordersPresetPreview,
  'quartz-icons': QuartzIconsPresetPreview,
  core: null,
};

export const PresetPreview = (props: PresetPreviewProps): ReactElement => {
  const PreviewComponent = previewComponentByType[props.part.partId];
  return (
    <>
      {PreviewComponent ? <PreviewComponent {...props} /> : null}
      {props.preset.label}
    </>
  );
};
