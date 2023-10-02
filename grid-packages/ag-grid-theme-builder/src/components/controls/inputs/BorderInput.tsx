import { borderStyleDefaultValue, colorDefaultValue, dimensionDefaultValue } from 'model/values';
import { BorderValue } from 'model/values/border';
import {
  BorderStyleVariableInfo,
  ColorVariableInfo,
  DimensionVariableInfo,
} from 'model/variableInfo';
import { useRef } from 'react';
import { BorderStyleInput } from './BorderStyleInput';
import { ColorInput } from './ColorInput';
import { DimensionInput } from './DimensionInput';
import { Input } from './Input';

const borderColorInfo: ColorVariableInfo = { type: 'color' };
const borderWidthInfo: DimensionVariableInfo = { type: 'dimension', min: 0, max: 50, step: 1 };
const borderStyleInfo: BorderStyleVariableInfo = { type: 'borderStyle' };

export const BorderInput: Input<'border'> = (props) => {
  const propsRef = useRef(props);
  propsRef.current = props;

  const onChange = (change: Partial<BorderValue>) => {
    props.onValueChange({ ...props.value, ...change });
  };

  return (
    <>
      {props.info.style && (
        <BorderStyleInput
          info={borderStyleInfo}
          value={props.value.style || borderStyleDefaultValue}
          onValueChange={(style) => onChange({ style })}
          error={null}
          onErrorChange={props.onErrorChange}
        />
      )}
      {props.info.width && (
        <DimensionInput
          info={borderWidthInfo}
          value={props.value.width || dimensionDefaultValue}
          onValueChange={(width) => onChange({ width })}
          error={null}
          onErrorChange={props.onErrorChange}
        />
      )}
      {props.info.color && (
        <ColorInput
          info={borderColorInfo}
          value={props.value.color || colorDefaultValue}
          onValueChange={(color) => onChange({ color })}
          error={null}
          onErrorChange={props.onErrorChange}
        />
      )}
    </>
  );
};
