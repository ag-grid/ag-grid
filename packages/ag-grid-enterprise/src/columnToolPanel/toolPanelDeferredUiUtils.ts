import type { BeanCollection } from 'ag-grid-community';

import type { ColumnToolPanel } from './columnToolPanel';
import type { ColumnToolPanelUpdateParams } from './updates/columnToolPanelUpdatesTypes';

export function refreshDeferredToolPanelUi(beans: BeanCollection, params?: ColumnToolPanelUpdateParams): void {
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
