import { useEffect, useRef, useState } from 'react';

import type { ParamModel } from '../../theming/ParamModel';
import { RGBAColor } from '../../theming/RGBAColor';
import { paramValueToCss } from '../../theming/api';
import { useRenderedTheme } from '../../theming/rendered-theme';
import { type ThemeImpl, cssValueIsValid, getThemeDefaultParams, reinterpretCSSValue } from '../../theming/utils';
import { Input } from './Input';
import { type ValueEditorProps } from './ValueEditorProps';

export const CssValueEditor = ({ param, value, onChange }: ValueEditorProps<unknown>) => {
    const theme = useRenderedTheme();
    const [editorValue, setEditorValue] = useState(() => getEditorValue(theme, param));
    const [valid, setValid] = useState(() => cssValueIsValid(editorValue, param.type));
    const hasFocus = useRef(false);

    useEffect(
        () => {
            if (!hasFocus.current) {
                setEditorValue(getEditorValue(theme, param));
            }
        },
        // intentionally run this when `value` changes even though the function uses different dependencies
        [value]
    );

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
                const newEditorValue = getEditorValue(theme, param);
                setEditorValue(newEditorValue);
                setValid(cssValueIsValid(newEditorValue, param.type));
            }}
        />
    );
};

const getEditorValue = (theme: ThemeImpl, param: ParamModel<unknown>): string => {
    const paramValue = getThemeDefaultParams(theme)[param.property];
    let cssValue = paramValueToCss(param.property, paramValue, null) || '';
    const reinterpreted = reinterpretCSSValue(cssValue, param.type);
    if (reinterpreted) {
        cssValue = reinterpreted;
    }
    return cssValue.replaceAll(
        /(color|rgba?|hsla?)\([^()]+\)/gi,
        (colorExpr) => RGBAColor.parseCss(colorExpr)?.toCSSHex() || colorExpr
    );
};
