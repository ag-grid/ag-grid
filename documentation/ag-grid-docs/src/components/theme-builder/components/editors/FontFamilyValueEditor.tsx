import { Select } from './Select';
import type { ValueEditorProps } from './ValueEditorProps';

export const FontFamilyValueEditor = ({ param, value, onChange }: ValueEditorProps) => {
    const selectedOption = fontOptionsByValue.get(value) || fontOptions[0];

    const options = param.property === 'fontFamily' ? topLevelOptions : subLevelOptions;

    return <Select options={options} value={selectedOption} onChange={(newValue) => onChange(newValue.value)} />;
};

const fontOptions = [
    {
        label: 'Times New Roman',
        value: 'Times New Roman',
    },
    {
        label: 'Jacquard 24',
        value: 'google:Jacquard 24',
    },
    {
        label: 'System',
        value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
    },
];
const topLevelOptions = [{ label: 'Inherit from application', value: 'inherit' }, ...fontOptions];
const subLevelOptions = [{ label: 'Unchanged', value: 'inherit' }, ...fontOptions];

const fontOptionsByValue = new Map(fontOptions.map((option) => [option.value, option]));
