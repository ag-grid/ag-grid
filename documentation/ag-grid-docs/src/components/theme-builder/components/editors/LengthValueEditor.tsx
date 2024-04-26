import { stripFloatingPointErrors } from '@components/theme-builder/model/utils';

import { FormattedInput } from './FormattedInput';
import { type ValueEditorProps } from './ValueEditorProps';

export const LengthValueEditor = ({ value, onChange, icon }: ValueEditorProps) => {
    return (
        <FormattedInput
            value={value}
            onChange={onChange}
            onClear={() => onChange(null)}
            valueToDisplayString={formatPxWithUnits}
            valueToEditingString={stripUnits}
            validateEditingString={(editingString) => {
                const parsed = parseFloat(editingString);
                return isNaN(parsed) ? null : `${parsed}px`;
            }}
            icon={icon}
            getIconSwipeAdjustment={(value, pixels) => {
                const proportion = parseFloat(value);
                if (isNaN(proportion)) return value;

                const rawAdjustment = parseFloat(Math.max(proportion + pixels / 100, 0).toFixed(1));
                return stripFloatingPointErrors(rawAdjustment) + 'px';
            }}
        />
    );
};

const formatPxWithUnits = (proportion: string) => {
    const parsed = parseFloat(proportion);
    return isNaN(parsed) ? proportion : parsed + 'px';
};

export const stripUnits = (value: string): string => {
    const number = parseFloat(String(value).trim());
    return isNaN(number) ? value : String(number);
};
