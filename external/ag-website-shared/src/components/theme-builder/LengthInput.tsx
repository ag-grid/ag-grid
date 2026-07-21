import type { ReactNode } from 'react';

import { reinterpretCSSValue, stripFloatingPointErrors } from '../../theming/utils';
import { FormattedInput } from './FormattedInput';

export type LengthInputProps = {
    /** A CSS length value, e.g. "12px" or "1.5em" */
    value: string;
    onChange: (newValue: string | null) => void;
    icon?: ReactNode;
    swipeAdjustmentDivisor?: number;
    /** Optional clamp on the numeric portion of the value. Unset means unclamped. */
    min?: number;
    max?: number;
};

export const LengthInput = ({ value, onChange, icon, swipeAdjustmentDivisor = 100, min, max }: LengthInputProps) => {
    const units = getUnit(value);

    const clampTyped = (n: number): number => {
        let result = n;
        if (min != null) result = Math.max(min, result);
        if (max != null) result = Math.min(max, result);
        return result;
    };

    const clampDrag = (n: number): number => {
        let result = Math.max(min ?? 0, n);
        if (max != null) result = Math.min(max, result);
        return result;
    };

    return (
        <FormattedInput
            value={value}
            onChange={onChange}
            onClear={() => onChange(null)}
            valueToDisplayString={toDisplayString}
            valueToEditingString={toEditingString}
            validateEditingString={(editingString) => {
                const parsed = parseFloat(editingString);
                return isNaN(parsed) ? null : `${clampTyped(parsed)}${units}`;
            }}
            icon={icon}
            getIconSwipeAdjustment={(currentValue, pixels) => {
                const proportion = parseFloat(currentValue);
                if (isNaN(proportion)) {
                    return currentValue;
                }

                const rawAdjustment = parseFloat(clampDrag(proportion + pixels / swipeAdjustmentDivisor).toFixed(1));
                return stripFloatingPointErrors(rawAdjustment) + units;
            }}
        />
    );
};

const toDisplayString = (value: string) => {
    value = value.trim();
    const reinterpreted = reinterpretCSSValue(value, 'length') || value;
    const unit = getUnit(reinterpreted);
    const parsed = parseFloat(reinterpreted);
    return isNaN(parsed) ? value : round2dp(parsed) + unit;
};

const toEditingString = (value: string): string => {
    value = value.trim();
    const reinterpreted = reinterpretCSSValue(value, 'length') || value;
    const number = parseFloat(reinterpreted);
    return isNaN(number) ? value : round2dp(number);
};

const cssFunctionRegex = /\w+\(/i;

const getUnit = (value: string) => {
    if (cssFunctionRegex.test(value)) {
        value = reinterpretCSSValue(value, 'length') || value;
    }
    const [unit] = value.match(/[^\d.]+$/) || [];
    return unit || '';
};

const round2dp = (value: number) => stripFloatingPointErrors(Math.round(value * 100) / 100);
