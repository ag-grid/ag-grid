import { Select } from './Select';
import type { ValueEditorProps } from './ValueEditorProps';

export const FontFamilyValueEditor = ({ param, value, onChange }: ValueEditorProps) => {
    const options = param.property === 'fontFamily' ? topLevelOptions : subLevelOptions;
    const selectedOption = options.find((o) => o.value === value) || options[0];

    return <Select options={options} value={selectedOption} onChange={(newValue) => onChange(newValue.value)} />;
};

const fontOptions = [
    {
        label: 'System',
        value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
    },
    {
        label: 'Arial',
        value: '"Arial" , sans-serif',
    },
    {
        label: 'Inter',
        value: 'google:Inter',
    },
    {
        label: 'IBM Plex Sans',
        value: 'google:IBM Plex Sans',
    },
    {
        label: 'IBM Plex Mono',
        value: 'google:IBM Plex Mono',
    },
    {
        label: 'Roboto',
        value: 'google:Roboto',
    },
    {
        label: 'Times New Roman',
        value: 'Times New Roman',
    },
    {
        label: 'Inclusive Sans',
        value: 'google:Inclusive Sans',
    },
    {
        label: 'Open Sans',
        value: 'google:Open Sans',
    },
    {
        label: 'Lato',
        value: 'google:Lato',
    },
    {
        label: 'Jacquard 24',
        value: 'google:Jacquard 24',
    },
];
const topLevelOptions = [{ label: 'Same as application', value: 'inherit' }, ...fontOptions];
const subLevelOptions = [{ label: 'Unchanged', value: 'inherit' }, ...fontOptions];
