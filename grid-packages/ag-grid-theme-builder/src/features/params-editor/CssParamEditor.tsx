import { Input } from '@mui/joy';
import { useState } from 'react';
import { ParamType } from '../../ag-grid-community-themes/metadata';
import { ParamModel, useParamAtom } from '../../model/ParamModel';

export type CssParamEditorProps = {
  param: ParamModel;
};

export const CssParamEditor = ({ param }: CssParamEditorProps) => {
  const [paramValue, setParamValue] = useParamAtom<string | null>(param);
  const [editorValue, setEditorValue] = useState(paramValue == null ? '' : String(paramValue));
  const [valid, setValid] = useState(() => cssStringIsValid(editorValue, param.meta.type));

  return (
    <Input
      error={!valid}
      value={editorValue}
      onChange={(e) => {
        const newValue = e.target.value;
        const isValid = cssStringIsValid(newValue, param.meta.type);
        setEditorValue(newValue);
        setValid(isValid);
        if (isValid) {
          setParamValue(newValue);
        }
      }}
    />
  );
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
    case 'border':
      cssProperty = 'borderLeft';
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
