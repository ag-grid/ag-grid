import { type BorderValue } from '../../theming/api';
import { Checkbox } from './Checkbox';
import type { ValueEditorProps } from './ValueEditorProps';

export const BorderValueEditor = ({ value, onChange }: ValueEditorProps<BorderValue>) => {
    const checked = !!value;
    return (
        <Checkbox
            checked={checked}
            onChange={(checked) => {
                onChange(checked);
            }}
            useSwitch
        />
    );
};
