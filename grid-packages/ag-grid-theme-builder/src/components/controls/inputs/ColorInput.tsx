import { color } from 'model/values/color';
import { Input } from './Input';
import { InputElement } from './InputElement';
import { useFocusInput } from './useFocusInput';

export const ColorInput: Input<'color'> = ({ value, onValueChange, focus }) => {
  return (
    <InputElement
      ref={useFocusInput(focus)}
      type="color"
      value={value.hex}
      onChange={(e) => onValueChange(color(e.target.value))}
    />
  );
};
