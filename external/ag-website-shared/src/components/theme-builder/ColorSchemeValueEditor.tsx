import { Select } from '@ag-website-shared/components/select/Select';

import { type ColorSchemeValue } from '../../theming/api';
import type { ValueEditorProps } from './ValueEditorProps';

export const ColorSchemeValueEditor = ({ value, onChange }: ValueEditorProps<ColorSchemeValue>) => {
    return <Select options={['inherit', 'light', 'dark']} value={value} onChange={onChange} />;
};
