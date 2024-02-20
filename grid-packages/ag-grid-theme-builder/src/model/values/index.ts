import { VariableInfo } from 'model/variableInfo';
import { Border } from './Border';
import { BorderStyle } from './BorderStyle';
import { Color } from './Color';
import { Dimension } from './Dimension';
import { Display } from './Display';
import { pickRequiredBorderValues } from './defaults';

export type ValueType = 'color' | 'dimension' | 'border' | 'borderStyle' | 'display';

export type ValueByType = {
  color: Color;
  dimension: Dimension;
  border: Border;
  borderStyle: BorderStyle;
  display: Display;
};

export type Value = ValueByType[ValueType];

export const parseCssString = (info: VariableInfo, css: string): Value | null => {
  switch (info.type) {
    case 'color':
      return Color.parseCss(css);
    case 'dimension':
      return Dimension.parseCss(css);
    case 'border':
      return pickRequiredBorderValues(info, Border.parseCss(css));
    case 'borderStyle':
      return BorderStyle.parseCss(css);
    case 'display':
      return Display.parseCss(css);
  }
};

export type VariableValues = Record<string, Value | null | undefined>;
