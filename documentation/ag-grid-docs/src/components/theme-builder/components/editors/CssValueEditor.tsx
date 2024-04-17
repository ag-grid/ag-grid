import { type ParamType } from '@ag-grid-community/theming';
import { useEffect, useRef, useState } from 'react';

import { Input } from './Input';
import { type ValueEditorProps } from './ValueEditorProps';

export const CssValueEditor = ({ param, value, onChange }: ValueEditorProps) => {
    const [editorValue, setEditorValue] = useState(value);
    const [valid, setValid] = useState(() => cssStringIsValid(editorValue, param.type));
    const hasFocus = useRef(false);

    useEffect(() => {
        if (!hasFocus.current) {
            setEditorValue(value);
        }
    }, [value]);

    return (
        <Input
            className={valid ? undefined : 'is-error'}
            value={editorValue}
            onChange={(newValue) => {
                const isValid = cssStringIsValid(newValue, param.type);
                setEditorValue(newValue);
                setValid(isValid);
                if (isValid) {
                    onChange(newValue.trim() || null);
                }
            }}
            onFocus={() => (hasFocus.current = true)}
            onBlur={() => {
                hasFocus.current = false;
                setEditorValue(value);
                setValid(cssStringIsValid(value, param.type));
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
    const cssProperty = cssPropertyForParamType[type];
    try {
        reinterpretationElement.style[cssProperty as any] = value;
        return reinterpretationElement.style[cssProperty] != '';
    } finally {
        reinterpretationElement.style[cssProperty as any] = '';
    }
};

const cssPropertyForParamType: Record<ParamType, keyof CSSStyleDeclaration> = {
    color: 'backgroundColor',
    length: 'paddingLeft',
    border: 'borderLeft',
    borderStyle: 'borderTopStyle',
    shadow: 'boxShadow',
    image: 'backgroundImage',
    fontFamily: 'fontFamily',
    fontWeight: 'fontWeight',
    display: 'display',
    duration: 'transitionDuration',
};

let reinterpretationElement: HTMLElement | null = null;
