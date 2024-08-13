import { Select } from '@ag-website-shared/components/select/Select';

import type { ValueEditorProps } from './ValueEditorProps';
import type { ColorSchemeValue } from '@ag-grid-community/theming';

export const ColorSchemeValueEditor = ({ value, onChange }: ValueEditorProps<ColorSchemeValue>) => {
    return <Select options={['inherit', 'light', 'dark']} value={value} onChange={onChange} />;
};
