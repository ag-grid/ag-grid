import type { BeanCollection, IToolPanel, SideBarDef } from '@ag-grid-community/core';
import { _unwrapUserComp } from '@ag-grid-community/core';

export function isSideBarVisible(beans: BeanCollection): boolean {
    return beans.sideBarService?.getSideBarComp().isDisplayed() ?? false;
}

export function setSideBarVisible(beans: BeanCollection, show: boolean) {
    beans.sideBarService?.getSideBarComp().setDisplayed(show);
}

export function setSideBarPosition(beans: BeanCollection, position: 'left' | 'right') {
    beans.sideBarService?.getSideBarComp().setSideBarPosition(position);
}

export function openToolPanel(beans: BeanCollection, key: string) {
    beans.sideBarService?.getSideBarComp().openToolPanel(key, 'api');
}

export function closeToolPanel(beans: BeanCollection) {
    beans.sideBarService?.getSideBarComp().close('api');
}

export function getOpenedToolPanel(beans: BeanCollection): string | null {
    return beans.sideBarService?.getSideBarComp().openedItem() ?? null;
}

export function refreshToolPanel(beans: BeanCollection): void {
    beans.sideBarService?.getSideBarComp().refresh();
}

export function isToolPanelShowing(beans: BeanCollection): boolean {
    return beans.sideBarService?.getSideBarComp().isToolPanelShowing() ?? false;
}

export function getToolPanelInstance<TToolPanel = IToolPanel>(
    beans: BeanCollection,
    id: string
): TToolPanel | undefined {
    const comp = beans.sideBarService?.getSideBarComp().getToolPanelInstance(id);
    return _unwrapUserComp(comp) as any;
}

export function getSideBar(beans: BeanCollection): SideBarDef | undefined {
    return beans.sideBarService?.getSideBarComp().getDef();
}
