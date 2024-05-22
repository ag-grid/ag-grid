import type { ReactNode } from 'react';

import type { ParamModel } from '../../model/ParamModel';

export type ValueEditorProps = {
    param: ParamModel;
    value: string;
    // onChange(null) to reset default
    onChange: (newValue: string | null) => void;
    icon?: ReactNode;
    swipeAdjustmentDivisor?: number;
};
