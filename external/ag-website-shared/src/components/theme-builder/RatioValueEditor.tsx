import { stripFloatingPointErrors } from '../../theming/utils';
import { FormattedInput } from './FormattedInput';
import type { ValueEditorProps } from './ValueEditorProps';

const parseRatio = (value: string) => {
    const ratio = parseFloat(value);
    return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
};

/** A unitless multiplier such as a line height ratio, shown as the raw number (1.5) rather than a percentage. */
export const RatioValueEditor = ({
    value,
    onChange,
    icon,
    swipeAdjustmentDivisor = 175,
    label,
}: ValueEditorProps<number>) => {
    return (
        <FormattedInput
            value={value == null ? '' : String(value)}
            onChange={(newValue) => {
                const parsed = parseRatio(newValue);
                if (parsed != null) {
                    onChange(parsed);
                }
            }}
            onClear={() => onChange(null)}
            ariaLabel={label}
            validateEditingString={(editingString) => {
                const ratio = parseRatio(editingString);
                return ratio == null ? null : stripFloatingPointErrors(ratio);
            }}
            icon={icon}
            getIconSwipeAdjustment={(value, pixels) => {
                const ratio = parseFloat(value);
                if (isNaN(ratio)) {
                    return value;
                }
                return stripFloatingPointErrors(ratio + pixels / swipeAdjustmentDivisor);
            }}
        />
    );
};
