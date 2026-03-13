import type { BeanCollection } from 'ag-grid-community';

import type { ColumnToolPanel } from './columnToolPanel';
import type { ColumnStateUpdateParams } from './updates/columnStateUpdateTypes';

export function refreshDeferredToolPanelUi(beans: BeanCollection, params?: ColumnStateUpdateParams): void {
    if (!params?.deferApply) {
        return;
    }

    const openedPanelId = beans.sideBar?.comp.openedItem();
    if (!openedPanelId) {
        return;
    }

    const toolPanel = beans.sideBar?.comp.getToolPanelInstance(openedPanelId) as ColumnToolPanel | undefined;
    toolPanel?.refreshDeferredUi();
}
