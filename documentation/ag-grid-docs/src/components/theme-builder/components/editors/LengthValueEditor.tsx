import { reinterpretCSSValue, stripFloatingPointErrors } from '@components/theme-builder/model/utils';

import { FormattedInput } from './FormattedInput';
import { type ValueEditorProps } from './ValueEditorProps';

export const LengthValueEditor = ({ value, onChange, icon, swipeAdjustmentDivisor = 100 }: ValueEditorProps) => {
    const units = getUnit(value);
    return (
        <FormattedInput
            value={value}
            onChange={onChange}
            onClear={() => onChange(null)}
            valueToDisplayString={toDisplayString}
            valueToEditingString={toEditingString}
            validateEditingString={(editingString) => {
                const parsed = parseFloat(editingString);
                return isNaN(parsed) ? null : `${parsed}${units}`;
            }}
            icon={icon}
            getIconSwipeAdjustment={(value, pixels) => {
                const proportion = parseFloat(value);
                if (isNaN(proportion)) return value;

                const rawAdjustment = parseFloat(Math.max(proportion + pixels / swipeAdjustmentDivisor, 0).toFixed(1));
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
    return /%\s*$/.test(value) ? '%' : 'px';
};

const round2dp = (value: number) => stripFloatingPointErrors(Math.round(value * 100) / 100);
