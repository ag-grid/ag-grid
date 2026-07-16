import { LengthInput } from '@ag-website-shared/components/theme-builder/LengthInput';
import type { ValueEditorProps } from '@ag-website-shared/components/theme-builder/ValueEditorProps';
import { type LengthValue, paramValueToCss } from '@ag-website-shared/theming/api';

export const LengthValueEditor = ({
    param,
    value,
    onChange,
    icon,
    swipeAdjustmentDivisor,
}: ValueEditorProps<LengthValue>) => {
    const cssValue = paramValueToCss(param.property, value, null) || '';
    return (
        <LengthInput value={cssValue} onChange={onChange} icon={icon} swipeAdjustmentDivisor={swipeAdjustmentDivisor} />
    );
};
