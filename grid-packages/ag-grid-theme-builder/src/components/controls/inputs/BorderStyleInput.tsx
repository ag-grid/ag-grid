import { BorderStyle, BorderStyleToken, allBorderStyles } from 'model/values/BorderStyle';
import { Input } from './Input';
import { useFocusInput } from './useFocusInput';

export const BorderStyleInput: Input<'borderStyle'> = ({ value, onValueChange, focus }) => {
  return (
    <select
      ref={useFocusInput(focus)}
      value={value.lineStyle}
      onChange={(e) => {
        onValueChange(new BorderStyle(e.target.value as BorderStyleToken));
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
