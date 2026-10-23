import type { ReactNode } from 'react';

import type { ParamModel } from '../../theming/ParamModel';

export type ValueEditorProps<T> = {
    param: ParamModel<T>;
    value: T;
    // onChange(null) to reset default
    onChange: (newValue: T | null) => void;
    /** The field's visible label, for a control with no text of its own. */
    label?: string;
    icon?: ReactNode;
    swipeAdjustmentDivisor?: number;
    // Optional clamp for numeric (length) editors; ignored by other editor types.
    min?: number;
    max?: number;
};
