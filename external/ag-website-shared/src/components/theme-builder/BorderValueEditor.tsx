import { Select } from '@ag-website-shared/components/select/Select';
import styled from '@emotion/styled';
import { useAtomValue } from 'jotai';
import { useRef } from 'react';

import { useParam } from '../../theming/ParamModel';
import { type BorderStyleValue, type BorderValue, paramValueToCss } from '../../theming/api';
import { getRenderedBaseThemeAtom } from '../../theming/base-theme';
import { useRenderedTheme } from '../../theming/rendered-theme';
import { getThemeDefaultParams } from '../../theming/utils';
import { Checkbox } from './Checkbox';
import { ColorPicker } from './ColorPicker';
import { FormField } from './FormField';
import { LengthInput } from './LengthInput';
import type { ValueEditorProps } from './ValueEditorProps';
import { type BorderPart, type BorderParts, borderIsOn, borderParts, withBorderPart } from './borderValue';
import { borderWidthIcon } from './icons';
import { followRefs, resolveColorValue } from './renderColorValue';

const BORDER_STYLES: BorderStyleValue[] = ['solid', 'dotted', 'dashed'];

let borderStyleEditable = true;
let inheritedBorders: Partial<Record<string, string>> = {};

/** Hides the style input, for hosts whose borders are always solid. */
export const setBorderStyleEditable = (editable: boolean) => {
    borderStyleEditable = editable;
};

/** Borders whose unset parts follow another border, rather than `borderColor` and `borderWidth`. */
export const setInheritedBorders = (borders: Partial<Record<string, string>>) => {
    inheritedBorders = borders;
};

/**
 * Turns the border on or off; sits in the field's label row. Switching back on restores the border
 * as it was, or else its default.
 */
export const BorderSwitch = ({ param, value, onChange, label }: ValueEditorProps<BorderValue>) => {
    const userValue = useParam(param);
    const params = getThemeDefaultParams(useRenderedTheme());
    const stockParams = getThemeDefaultParams(useAtomValue(getRenderedBaseThemeAtom()));
    // A default that copies another border follows that border as it is now, which may be off.
    const defaultIsOn = borderIsOn(param.property, stockParams[param.property], params);
    const valueWhenOn = useRef<BorderValue | undefined>();
    const toggle = (on: boolean) => {
        if (on) {
            onChange(valueWhenOn.current ?? (defaultIsOn ? null : stockBorder(param.property, stockParams, params)));
        } else {
            valueWhenOn.current = userValue;
            onChange(defaultIsOn ? false : null);
        }
    };
    return (
        <Checkbox checked={borderIsOn(param.property, value, params)} onChange={toggle} useSwitch ariaLabel={label} />
    );
};

/** The stock border as a value of its own, its width written out so it holds while a border it copies is off. */
const stockBorder = (property: string, stockParams: any, params: any): BorderValue => {
    const { width, ...parts } = borderParts(stockParams[property], stockParams);
    const ownParts: BorderParts = { ...parts, ...(width != null && { width: followRefs(width, params) }) };
    return Object.keys(ownParts).length ? ownParts : true;
};

export const BorderValueEditor = ({ param, value, onChange }: ValueEditorProps<BorderValue>) => {
    const params = getThemeDefaultParams(useRenderedTheme());
    if (!borderIsOn(param.property, value, params)) {
        return null;
    }
    const parts = borderParts(value, params);
    const inherited = inheritedBorders[param.property];
    const inheritedParts = inherited ? borderParts(params[inherited] as BorderValue | undefined, params) : {};
    const label = param.label.toLowerCase();
    const setPart = <K extends BorderPart>(part: K, partValue: BorderParts[K] | null) =>
        onChange(withBorderPart(value, part, partValue, params));

    const color = resolveColorValue(parts.color ?? inheritedParts.color ?? { ref: 'borderColor' }, params);
    const width = followRefs(parts.width ?? inheritedParts.width ?? { ref: 'borderWidth' }, params);

    return (
        <Parts>
            <FormField label="Color">
                <ColorPicker
                    preventTransparency={false}
                    ariaLabel={`${label} color`}
                    value={paramValueToCss('borderColor', color, null) || ''}
                    onChange={(newColor) => setPart('color', newColor)}
                />
            </FormField>
            <Row>
                <FormField label="Width">
                    <LengthInput
                        value={paramValueToCss('borderWidth', width, null) || ''}
                        min={0}
                        icon={borderWidthIcon}
                        swipeAdjustmentDivisor={20}
                        onChange={(newWidth) => setPart('width', newWidth)}
                    />
                </FormField>
                {borderStyleEditable && (
                    <FormField label="Style">
                        <Select
                            options={BORDER_STYLES}
                            value={parts.style ?? inheritedParts.style ?? 'solid'}
                            renderItem={renderStyleOption}
                            triggerAriaLabel={`${label} style`}
                            onChange={(newStyle) => setPart('style', newStyle)}
                        />
                    </FormField>
                )}
            </Row>
        </Parts>
    );
};

const STYLE_DASHES: Record<string, string> = { dotted: '0 3', dashed: '4 2.5' };

/** Shows a sample of the line beside each style's name. */
const renderStyleOption = (style: BorderStyleValue) => {
    const name = String(style);
    return (
        <StyleOption>
            <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true">
                <line
                    x1="1"
                    y1="4"
                    x2="19"
                    y2="4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray={STYLE_DASHES[name]}
                />
            </svg>
            {name}
        </StyleOption>
    );
};

const StyleOption = styled('span')`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const Parts = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Row = styled('div')`
    display: flex;
    gap: 12px;
    > * {
        flex: 1;
    }
`;
