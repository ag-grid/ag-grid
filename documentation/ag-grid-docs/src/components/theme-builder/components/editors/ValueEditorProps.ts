import type { ReactNode } from 'react';

import type { ParamModel } from '../../model/ParamModel';

export type ValueEditorProps<T> = {
    param: ParamModel<T>;
    value: T;
    // onChange(null) to reset default
    onChange: (newValue: T | null) => void;
    icon?: ReactNode;
    swipeAdjustmentDivisor?: number;
};
