import type { ColorSchemeValue } from '@ag-grid-community/theming';
import { Select } from '@ag-website-shared/components/select/Select';

import type { ValueEditorProps } from './ValueEditorProps';

export const ColorSchemeValueEditor = ({ value, onChange }: ValueEditorProps<ColorSchemeValue>) => {
    return <Select options={['inherit', 'light', 'dark']} value={value} onChange={onChange} />;
};
