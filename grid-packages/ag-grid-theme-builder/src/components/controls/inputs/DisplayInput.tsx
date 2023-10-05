import { display } from 'model/values/display';
import { Input } from './Input';
import { InputElement } from './InputElement';
import { useFocusInput } from './useFocusInput';

export const DisplayInput: Input<'display'> = ({ value, onValueChange, focus }) => {
  return (
    <InputElement
      ref={useFocusInput(focus)}
      type="checkbox"
      checked={value.display !== 'none'}
      onChange={(e) => onValueChange(display(e.target.checked ? 'block' : 'none'))}
    />
  );
};
