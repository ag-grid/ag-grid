import { ResultOrError, clamp } from 'model/utils';
import { Dimension } from 'model/values/Dimension';
import { DimensionVariableInfo } from 'model/variableInfo';
import { useEffect, useRef, useState } from 'react';
import { Input } from './Input';
import { InputElement } from './InputElement';
import { useFocusInput } from './useFocusInput';

export const DimensionInput: Input<'dimension'> = (props) => {
  const propsRef = useRef(props);
  propsRef.current = props;

  const [inputValue, setInputValue] = useState(String(props.value.number));

  useEffect(() => {
    // use props from ref so that we don't need to pass it in the useEffect
    // block dependencies, since we only want this useEffect block to fire
    // when the editor value changes
    const props = propsRef.current;
    const parsed = parseInputValue(inputValue, props.info);
    if (parsed.ok && parsed.result !== props.value.number) {
      props.onValueChange(new Dimension(parsed.result, props.value.units));
    }
    const error = parsed.ok ? null : parsed.error;
    if (error !== props.error) {
      props.onErrorChange(error);
    }
  }, [inputValue]);

  useEffect(() => {
    setInputValue(String(props.value.number));
  }, [props.value.number]);

  return (
    <>
      <InputElement
        ref={useFocusInput(props.focus)}
        type="number"
        value={inputValue}
        style={{
          width: clamp(inputValue.length * charWidth, minWidth, maxWidth) + additionalWidth,
        }}
        className={props.error ? 'is-error' : undefined}
        min={props.info.min}
        max={props.info.max}
        step={props.info.step}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={() => setInputValue(String(props.value.number))}
      />
      {props.value.units}
    </>
  );
};

const minWidth = 20;
const charWidth = 30;
const additionalWidth = 40;
const maxWidth = 100;

const parseInputValue = (
  value: string,
  { min, max }: DimensionVariableInfo,
): ResultOrError<number> => {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    return { ok: false, error: 'Enter a number' };
  }
  const clamped = Math.max(min, Math.min(max, parsed));
  if (clamped !== parsed) {
    return { ok: false, error: `Enter a value between ${min} and ${max}` };
  }
  return { ok: true, result: parsed };
};
