import { Select } from '@ag-website-shared/components/select/Select';

import type { ValueEditorProps } from './ValueEditorProps';

export const BorderStyleValueEditor = ({ value, onChange }: ValueEditorProps) => {
    return <Select options={['none', 'solid', 'dotted', 'dashed']} value={value} onChange={onChange} />;
};
