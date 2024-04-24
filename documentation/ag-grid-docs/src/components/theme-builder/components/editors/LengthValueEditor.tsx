import { FormattedInput } from './FormattedInput';
import { type ValueEditorProps } from './ValueEditorProps';

export const LengthValueEditor = ({ value, onChange, icon }: ValueEditorProps) => {
    return (
        <FormattedInput
            value={value}
            onChange={onChange}
            onClear={() => onChange(null)}
            valueToEditingString={stripUnits}
            validateEditingString={(editingString) => {
                const parsed = parseFloat(editingString);
                return isNaN(parsed) ? null : `${parsed}px`;
            }}
            icon={icon}
        />
    );
};

export const stripUnits = (value: string): string => {
    const number = parseFloat(String(value).trim());
    return isNaN(number) ? value : String(number);
};
