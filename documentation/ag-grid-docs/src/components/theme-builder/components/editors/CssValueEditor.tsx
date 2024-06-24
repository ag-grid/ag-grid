import { type ParamType } from '@ag-grid-community/theming';
import { cssValueIsValid, reinterpretCSSValue } from '@components/theme-builder/model/utils';
import { useEffect, useRef, useState } from 'react';

import { Input } from './Input';
import { RGBAColor } from './RGBAColor';
import { type ValueEditorProps } from './ValueEditorProps';

export const CssValueEditor = ({ param, value, onChange }: ValueEditorProps) => {
    const [editorValue, setEditorValue] = useState(() => getEditorValue(value, param.type));
    const [valid, setValid] = useState(() => cssValueIsValid(editorValue, param.type));
    const hasFocus = useRef(false);

    useEffect(() => {
        if (!hasFocus.current) {
            setEditorValue(getEditorValue(value, param.type));
        }
    }, [value]);

    return (
        <Input
            className={valid ? undefined : 'is-error'}
            value={editorValue}
            onChange={(newValue) => {
                const isValid = cssValueIsValid(newValue, param.type);
                setEditorValue(newValue);
                setValid(isValid);
                if (isValid) {
                    onChange(newValue.trim() || null);
                }
            }}
            onFocus={() => (hasFocus.current = true)}
            onBlur={() => {
                hasFocus.current = false;
                setEditorValue(getEditorValue(value, param.type));
                setValid(cssValueIsValid(value, param.type));
            }}
        />
    );
};

const getEditorValue = (value: string, type: ParamType): string => {
    const reinterpreted = reinterpretCSSValue(value, type);
    if (reinterpreted) {
        value = reinterpreted;
    }
    return value.replaceAll(
        /(color|rgba?|hsla?)\([^()]+\)/gi,
        (colorExpr) => RGBAColor.parseCss(colorExpr)?.toCSSHex() || colorExpr
    );
};
