import { color } from 'model/values';
import { useEffect, useRef } from 'react';
import { Input } from './Input';
import { InputElement } from './InputElement';

export const ColorInput: Input<'color'> = ({ value, onValueChange, initialFocus }) => {
  const initialFocusRef = useRef(initialFocus);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFocusRef.current) {
      inputRef.current?.focus();
    }
  }, []);

  return (
    <InputElement
      ref={inputRef}
      type="color"
      value={value.hex}
      onChange={(e) => onValueChange(color(e.target.value))}
    />
  );
};
