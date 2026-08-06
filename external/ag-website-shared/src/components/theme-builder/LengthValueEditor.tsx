import { type LengthValue, paramValueToCss } from '../../theming/api';
import { LengthInput } from './LengthInput';
import type { ValueEditorProps } from './ValueEditorProps';

export const LengthValueEditor = ({
    param,
    value,
    onChange,
    icon,
    swipeAdjustmentDivisor,
    min,
    max,
}: ValueEditorProps<LengthValue>) => {
    const cssValue = paramValueToCss(param.property, value, null) || '';
    return (
        <LengthInput
            value={cssValue}
            onChange={onChange}
            icon={icon}
            swipeAdjustmentDivisor={swipeAdjustmentDivisor}
            min={min}
            max={max}
        />
    );
};
