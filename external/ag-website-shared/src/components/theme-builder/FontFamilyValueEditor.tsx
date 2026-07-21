import { Select } from '@ag-website-shared/components/select/Select';
import styled from '@emotion/styled';

import { type FontFamilyValue, paramValueToCss } from '../../theming/api';
import type { ValueEditorProps } from './ValueEditorProps';

export type FontFamilyOption = { label: string; value: FontFamilyValue };

let fontOptions: FontFamilyOption[] = [];

/**
 * Hosts must call this once with their curated list of font choices before
 * FontFamilyValueEditor is rendered - mirrors ParamModel's
 * setParamDocsProvider. Each host's font list is an editorial choice, not
 * something derivable from the theming engine.
 */
export const setFontFamilyOptions = (options: FontFamilyOption[]) => {
    fontOptions = options;
};

export const FontFamilyValueEditor = ({ param, value, onChange }: ValueEditorProps<FontFamilyValue>) => {
    const inheritLabel = param.property === 'fontFamily' ? 'Same as application' : 'Unchanged';
    const options: FontFamilyOption[] = [{ label: inheritLabel, value: 'inherit' }, ...fontOptions];
    const selectedOption = options.find((o) => isSameFont(o.value, value)) || options[0];

    return (
        <Select
            options={options}
            value={selectedOption}
            getKey={(option) => option.label}
            onChange={(newValue) => onChange(newValue.value)}
            renderItem={(o) => {
                const font = paramValueToCss('fontFamily', o.value, null);
                return (
                    <FontItem style={{ fontFamily: typeof font === 'string' ? font : undefined }}>{o.label}</FontItem>
                );
            }}
        />
    );
};

const FontItem = styled('span')``;

export const LoadFontFamilyMenuFonts = () => {
    const css = fontOptions
        .map(({ value }) => value)
        .filter((v: unknown): v is { googleFont: string } => typeof v === 'object' && v != null && 'googleFont' in v)
        .map((v) => v.googleFont)
        .sort()
        .map(
            (font) =>
                `@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@100;200;300;400;500;600;700;800;900&display=swap');\n`
        )
        .join('\n');
    return <style>{css}</style>;
};

const isSameFont = (a: FontFamilyValue, b: FontFamilyValue): boolean =>
    (Array.isArray(b) && isSameFont(a, b[0])) ||
    (Array.isArray(a) && isSameFont(a[0], b)) ||
    paramValueToCss('fontFamily', a, null) === paramValueToCss('fontFamily', b, null);
