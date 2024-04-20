import { Select } from './Select';
import type { ValueEditorProps } from './ValueEditorProps';

export const FontFamilyValueEditor = ({ param, value, onChange }: ValueEditorProps) => {
    const options = param.property === 'fontFamily' ? topLevelOptions : subLevelOptions;
    const selectedOption = options.find((o) => o.value === value) || options[0];

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
const topLevelOptions = [{ label: 'Same as application', value: 'inherit' }, ...fontOptions];
const subLevelOptions = [{ label: 'Unchanged', value: 'inherit' }, ...fontOptions];

const fontOptionsByValue = new Map(fontOptions.map((option) => [option.value, option]));
