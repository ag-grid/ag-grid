import { type ColorValue, paramValueToCss } from '../../theming/api';
import { ColorPicker } from './ColorPicker';
import type { ValueEditorProps } from './ValueEditorProps';

export const ColorValueEditor = ({ param, value, onChange }: ValueEditorProps<ColorValue>) => (
    <ColorPicker
        preventTransparency={param.property === 'backgroundColor' || param.property === 'dataBackgroundColor'}
        value={paramValueToCss(param.property, value, null) || ''}
        onChange={onChange}
    />
);
