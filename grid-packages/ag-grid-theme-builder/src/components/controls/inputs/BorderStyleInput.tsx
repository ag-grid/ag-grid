import { BorderStyle, allBorderStyles, borderStyle } from 'model/values/borderStyle';
import { useEffect, useRef } from 'react';
import { Input } from './Input';

export const BorderStyleInput: Input<'borderStyle'> = ({ value, onValueChange, initialFocus }) => {
  const initialFocusRef = useRef(initialFocus);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFocusRef.current) {
      inputRef.current?.focus();
    }
  }, []);

  return (
    <select
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
