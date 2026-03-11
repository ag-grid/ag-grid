import type { BeanCollection } from 'ag-grid-community';

import type { BaseColumnToolPanelEdits } from './columnToolPanelEditsTypes';

export function getColumnToolPanelEditStrategy(
    beans: BeanCollection,
    deferApply: boolean | undefined
): BaseColumnToolPanelEdits | undefined {
    return (deferApply ? beans.colToolPanelDeferredEdit : beans.colToolPanelSynchronousEdit) as
        | BaseColumnToolPanelEdits
        | undefined;
}
