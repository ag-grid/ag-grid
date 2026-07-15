import type { ParamModel } from '@ag-website-shared/theming/ParamModel';
import type { ReactNode } from 'react';

export type ValueEditorProps<T> = {
    param: ParamModel<T>;
    value: T;
    // onChange(null) to reset default
    onChange: (newValue: T | null) => void;
    icon?: ReactNode;
    swipeAdjustmentDivisor?: number;
};
