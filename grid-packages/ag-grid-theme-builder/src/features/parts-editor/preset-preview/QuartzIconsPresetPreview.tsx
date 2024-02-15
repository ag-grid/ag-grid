import { PresetModel } from '../../../model/PartModel';

type QuartzIconsPresetPreviewProps = {
  preset: PresetModel;
};

export const QuartzIconsPresetPreview = ({ preset }: QuartzIconsPresetPreviewProps) => {
  const params = preset.getFullPartParamValues();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={params.iconStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    >
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
    </svg>
  );
};
