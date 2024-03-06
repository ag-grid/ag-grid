import { presetParamName } from '../theme-utils';

export type PartMeta = {
  partId: string;
  params?: ParamMeta[];
  iconsFile?: string;
};

export const definePartMeta = (partMeta: PartMeta): PartMeta => {
  if (partMeta.presets) {
    const presetParam = presetParamName(partMeta.partId);
    const hasPresetParam = partMeta.params?.some((param) => param.property === presetParam);
    if (!hasPresetParam) {
      const presetNames = partMeta.presets.map((p) => JSON.stringify(p.presetId));
      partMeta.params = [
        {
          property: presetParam,
          docs: `Use one of the built-in sets of preset ${partMeta.partId} values. Available presets are: ${presetNames.join(', ')}.`,
          type: 'preset',
          presetNames,
          defaultValue: null,
        },
        ...(partMeta.params || []),
      ];
    }
  }
  return partMeta;
};

export type PresetMeta = {
  presetId: string;
  paramValues: Record<string, any>;
  isDefault?: boolean;
};

export type ParamMeta =
  | PresetParam
  | ColorParam
  | LengthParam
  | BorderParam
  | BorderStyleParam
  | CssExpressionParam;

export type ParamType = ParamMeta['type'];

export type ParamCommon = {
  property: string;
  docs: string;
  defaultValueComment?: string;
};

export type PresetParam = ParamCommon & {
  type: 'preset';
  presetNames: string[];
  defaultValue: string | null;
};

export type Helper = { helper: string; arg?: any };
export type CssOrHelper<T = string> = T | Helper;

export type ColorParam = ParamCommon & {
  type: 'color';
  defaultValue: CssOrHelper;
  preventTransparency?: boolean;
  preventVariables?: boolean;
};

export type LengthParam = ParamCommon & {
  type: 'length';
  defaultValue: CssOrHelper;
  min: number;
  max: number;
  step: number;
};

export const cssBorderStyles = ['solid', 'dotted', 'dashed', 'none'] as const;

export type CSSBorderStyle = (typeof cssBorderStyles)[number];

export type BorderStyleParam = ParamCommon & {
  type: 'borderStyle';
  defaultValue: CssOrHelper<CSSBorderStyle>;
};

export type BorderParam = ParamCommon & {
  type: 'border';
  defaultValue: boolean | CssOrHelper;
};

export type CssExpressionParam = ParamCommon & {
  type: 'css';
  defaultValue: CssOrHelper;
};
