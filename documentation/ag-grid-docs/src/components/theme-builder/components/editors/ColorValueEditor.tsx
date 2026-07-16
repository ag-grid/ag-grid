import { ColorPicker } from '@ag-website-shared/components/theme-builder/ColorPicker';
import type { ValueEditorProps } from '@ag-website-shared/components/theme-builder/ValueEditorProps';
import { type ColorValue, paramValueToCss } from '@ag-website-shared/theming/api';

export const ColorValueEditor = ({ param, value, onChange }: ValueEditorProps<ColorValue>) => (
    <ColorPicker
        preventTransparency={param.property === 'backgroundColor' || param.property === 'dataBackgroundColor'}
        value={paramValueToCss(param.property, value, null) || ''}
        onChange={onChange}
    />
);
