import { ValueByType } from 'model/values';
import { VariableInfoByType, VariableType } from 'model/variables';
import { FC } from 'react';

export type InputProps<T extends VariableType> = {
  value: ValueByType[T];
  info: VariableInfoByType[T];
  onValueChange: (value: ValueByType[T]) => void;
  error: string | null;
  onErrorChange: (error: string | null) => void;
  initialFocus?: boolean;
};

export type Input<T extends VariableType> = FC<InputProps<T>>;
