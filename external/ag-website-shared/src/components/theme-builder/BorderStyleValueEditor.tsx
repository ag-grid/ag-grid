import { Select } from '@ag-website-shared/components/select/Select';

import { type BorderStyleValue } from '../../theming/api';
import type { ValueEditorProps } from './ValueEditorProps';

export const BorderStyleValueEditor = ({ value, onChange, label }: ValueEditorProps<BorderStyleValue>) => {
    return (
        <Select
            options={['none', 'solid', 'dotted', 'dashed']}
            value={value}
            onChange={onChange}
            triggerAriaLabel={label}
        />
    );
};
