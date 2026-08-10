import type { ReactNode } from 'react';

import type { ParamModel } from '../../theming/ParamModel';

export type ValueEditorProps<T> = {
    param: ParamModel<T>;
    value: T;
    // onChange(null) to reset default
    onChange: (newValue: T | null) => void;
    icon?: ReactNode;
    swipeAdjustmentDivisor?: number;
    // Optional clamp for numeric (length) editors; ignored by other editor types.
    min?: number;
    max?: number;
};
