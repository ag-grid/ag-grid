import { Select } from '@ag-website-shared/components/select/Select';

import { type ScrollbarWidthValue } from '../../theming/api';
import type { ValueEditorProps } from './ValueEditorProps';

export const ScrollbarWidthValueEditor = ({ value, onChange }: ValueEditorProps<ScrollbarWidthValue>) => {
    return <Select options={['unset', 'auto', 'thin', 'none']} value={value} onChange={onChange} />;
};
