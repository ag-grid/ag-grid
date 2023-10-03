import { BorderValue } from 'model/values/border';
import {
  borderStyleDefaultValue,
  colorDefaultValue,
  dimensionDefaultValue,
} from 'model/values/defaults';
import {
  BorderStyleVariableInfo,
  ColorVariableInfo,
  DimensionVariableInfo,
} from 'model/variableInfo';
import { BorderStyleInput } from './BorderStyleInput';
import { ColorInput } from './ColorInput';
import { DimensionInput } from './DimensionInput';
import { Input } from './Input';

const borderColorInfo: ColorVariableInfo = { type: 'color' };
const borderWidthInfo: DimensionVariableInfo = { type: 'dimension', min: 0, max: 50, step: 1 };
const borderStyleInfo: BorderStyleVariableInfo = { type: 'borderStyle' };

export const BorderInput: Input<'border'> = ({
  info,
  value,
  onValueChange,
  error,
  onErrorChange,
  focus,
}) => {
  const onChange = (change: Partial<BorderValue>) => {
    onValueChange({ ...value, ...change });
  };

  const focusStyle = focus && !!info.style;
  const focusWidth = focus && !!info.width && !focusStyle;
  const focusColor = focus && !!info.color && !focusWidth;

  const isNone = value.style?.lineStyle === 'none';

  return (
    <>
      {info.style && (
        <BorderStyleInput
          info={borderStyleInfo}
          value={value.style || borderStyleDefaultValue}
          onValueChange={(style) => onChange({ style })}
          error={null}
          onErrorChange={onErrorChange}
          focus={focusStyle}
        />
      )}
      {info.width && !isNone && (
        <DimensionInput
          info={borderWidthInfo}
          value={value.width || dimensionDefaultValue}
          onValueChange={(width) => onChange({ width })}
          error={error}
          onErrorChange={onErrorChange}
          focus={focusWidth}
        />
      )}
      {info.color && !isNone && (
        <ColorInput
          info={borderColorInfo}
          value={value.color || colorDefaultValue}
          onValueChange={(color) => onChange({ color })}
          error={null}
          onErrorChange={onErrorChange}
          focus={focusColor}
        />
      )}
    </>
  );
};
