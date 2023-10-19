import { logErrorMessage } from 'model/utils';
import { Color } from 'model/values/Color';
import { Input } from './Input';
import { InputElement } from './InputElement';
import { useFocusInput } from './useFocusInput';

export const ColorInput: Input<'color'> = ({ value, onValueChange, focus }) => {
  const hex = '#' + float1ToHex255(value.r) + float1ToHex255(value.g) + float1ToHex255(value.b);
  return (
    <InputElement
      ref={useFocusInput(focus)}
      type="color"
      value={hex}
      onChange={(e) => {
        const parsed = Color.parseCss(e.target.value);
        if (!parsed) {
          logErrorMessage(`Color input returned unexpected unparsable value "${e.target.value}"`);
          return;
        }
        onValueChange(parsed);
      }}
    />
  );
};

const float1ToHex255 = (alpha: number): string =>
  ('0' + Math.min(255, Math.max(0, Math.round(alpha * 255))).toString(16)).slice(-2);
