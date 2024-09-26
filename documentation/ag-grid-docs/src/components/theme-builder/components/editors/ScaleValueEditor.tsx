import { stripFloatingPointErrors } from '@components/theme-builder/model/utils';

import type { ScaleValue } from 'ag-grid-community';

import { FormattedInput } from './FormattedInput';
import { type ValueEditorProps } from './ValueEditorProps';

export const ScaleValueEditor = ({
    value,
    onChange,
    icon,
    swipeAdjustmentDivisor = 175,
}: ValueEditorProps<ScaleValue>) => {
    return (
        <FormattedInput
            value={String(value)}
            onChange={(newValue) => {
                const parsed = parseFloat(newValue);
                if (!isNaN(parsed)) {
                    onChange(parsed);
                }
            }}
            onClear={() => onChange(null)}
            valueToDisplayString={formatPercentWithUnits}
            valueToEditingString={formatPercentNumber}
            validateEditingString={(editingString) => {
                const percent = parseFloat(editingString);
                return isNaN(percent) ? null : stripFloatingPointErrors(percent / 100);
            }}
            icon={icon}
            getIconSwipeAdjustment={(value, pixels) => {
                const proportion = parseFloat(value);
                if (isNaN(proportion)) return value;
                return stripFloatingPointErrors(proportion + pixels / swipeAdjustmentDivisor);
            }}
        />
    );
};

const formatPercentWithUnits = (proportion: string) => {
    const parsed = parseFloat(proportion);
    return isNaN(parsed) ? proportion : Math.round(parsed * 100) + '%';
};

const formatPercentNumber = (proportion: string) => {
    const parsed = parseFloat(proportion);
    return isNaN(parsed) ? proportion : String(Math.round(parsed * 100));
};
