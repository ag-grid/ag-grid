import { ColorPicker } from '@ag-website-shared/components/theme-builder/ColorPicker';
import { type ColorValue, paramValueToCss } from '@ag-website-shared/theming/api';

import { type ValueEditorProps } from './ValueEditorProps';

export const ColorValueEditor = ({ param, value, onChange }: ValueEditorProps<ColorValue>) => (
    <ColorPicker
        preventTransparency={param.property === 'backgroundColor' || param.property === 'dataBackgroundColor'}
        value={paramValueToCss(param.property, value, null) || ''}
        onChange={onChange}
    />
);
