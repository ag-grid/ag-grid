import { BorderStyle, allBorderStyles, borderStyle } from 'model/values/borderStyle';
import { Input } from './Input';
import { useFocusInput } from './useFocusInput';

export const BorderStyleInput: Input<'borderStyle'> = ({ value, onValueChange, focus }) => {
  return (
    <select
      ref={useFocusInput(focus)}
      value={value.lineStyle}
      onChange={(e) => {
        onValueChange(borderStyle(e.target.value as BorderStyle));
      }}
    >
      {options}
    </select>
  );
};

const options = (
  <>
    {allBorderStyles.map((style) => (
      <option key={style} value={style}>
        {style}
      </option>
    ))}
  </>
);
