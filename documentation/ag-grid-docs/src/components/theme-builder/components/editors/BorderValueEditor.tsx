import { paramValueToCss } from '@ag-grid-community/theming';
import { reinterpretCSSValue } from '@components/theme-builder/model/utils';

import { Checkbox } from '../general/Checkbox';
import type { ValueEditorProps } from './ValueEditorProps';

export const BorderValueEditor = ({ param, value, onChange }: ValueEditorProps) => {
    const checked = getEditorValue(value);
    return (
        <Checkbox
            checked={checked}
            onChange={(checked) => {
                const css = paramValueToCss(param.property, checked);
                if (css instanceof Error) {
                    throw css;
                }
                onChange(css);
            }}
            useSwitch
        />
    );
};

const getEditorValue = (value: string | boolean): boolean => {
    if (typeof value === 'boolean') return value;
    if (hiddenRe.test(value) || transparentRe.test(value)) return false;
    const reinterpreted = reinterpretCSSValue(value, 'border') || String(value);
    return !(hiddenRe.test(reinterpreted) || transparentRe.test(reinterpreted));
};

const hiddenRe = /\b(none|hidden|transparent)\b/i;
const transparentRe = /#0000\b|#00000000\b|rgba\([0,\s%]+\)|color\([^)]+\/\s*[0.]+\s*\)/i;
