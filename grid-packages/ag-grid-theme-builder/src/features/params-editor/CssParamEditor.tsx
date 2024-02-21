import { Input } from '@mui/joy';
import { useEffect, useState } from 'react';
import { ParamType } from '../../ag-grid-community-themes/metadata';
import { ParamModel, useParamAtom } from '../../model/ParamModel';

export type CssParamEditorProps = {
  param: ParamModel;
};

export const CssParamEditor = ({ param }: CssParamEditorProps) => {
  const [rawValue, setValue] = useParamAtom<string>(param);
  const value = rawValue == null ? '' : String(rawValue);
  const [valid, setValid] = useState(() => cssStringIsValid(value, param.meta.type));

  useEffect(() => {
    setValid(cssStringIsValid(value, param.meta.type));
  }, [value, param.meta.type]);

  return <Input error={!valid} value={String(value)} onChange={(e) => setValue(e.target.value)} />;
};

const cssStringIsValid = (value: string, type: ParamType): boolean => {
  value = value.trim();
  if (value === '') return true;
  if (!reinterpretationElement) {
    reinterpretationElement = document.createElement('span');
    document.body.appendChild(reinterpretationElement);
  }
  let cssProperty: keyof CSSStyleDeclaration;
  switch (type) {
    case 'length':
      cssProperty = 'paddingLeft';
      break;
    case 'borderStyle':
      cssProperty = 'borderLeftStyle';
      break;
    case 'color':
      cssProperty = 'color';
      break;
    case 'css':
    case 'boolean':
    case 'preset':
      return true;
  }
  try {
    reinterpretationElement.style[cssProperty] = value;
    return reinterpretationElement.style[cssProperty] != '';
  } finally {
    reinterpretationElement.style[cssProperty] = '';
  }
};

let reinterpretationElement: HTMLElement | null = null;
