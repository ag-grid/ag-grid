import { ValueByType, ValueType } from 'model/values';
import { VariableInfoByType } from 'model/variableInfo';
import { FC } from 'react';

export type InputProps<T extends ValueType> = {
  value: ValueByType[T];
  info: VariableInfoByType[T];
  onValueChange: (value: ValueByType[T]) => void;
  error: string | null;
  onErrorChange: (error: string | null) => void;
  focus: boolean;
};

export type Input<T extends ValueType> = FC<InputProps<T>>;
