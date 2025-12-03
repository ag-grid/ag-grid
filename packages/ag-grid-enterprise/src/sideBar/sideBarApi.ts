import type { IToolPanel, SideBarDef, _BeanCollection } from 'ag-grid-community';
import { _unwrapUserComp } from 'ag-grid-community';

export function isSideBarVisible(beans: _BeanCollection): boolean {
    return beans.sideBar?.comp.isDisplayed() ?? false;
}

export function setSideBarVisible(beans: _BeanCollection, show: boolean) {
    beans.sideBar?.comp.setDisplayed(show);
}

export function setSideBarPosition(beans: _BeanCollection, position: 'left' | 'right') {
    beans.sideBar?.comp.setSideBarPosition(position);
}

export function openToolPanel(beans: _BeanCollection, key: string, parent?: HTMLElement | null) {
    beans.sideBar?.comp.openToolPanel(key, 'api', parent);
}

export function closeToolPanel(beans: _BeanCollection) {
    beans.sideBar?.comp.close('api');
}

export function getOpenedToolPanel(beans: _BeanCollection): string | null {
    return beans.sideBar?.comp.openedItem() ?? null;
}

export function refreshToolPanel(beans: _BeanCollection): void {
    beans.sideBar?.comp.refresh();
}

export function isToolPanelShowing(beans: _BeanCollection): boolean {
    return beans.sideBar?.comp.isToolPanelShowing() ?? false;
}

export function getToolPanelInstance<TToolPanel = IToolPanel>(
    beans: _BeanCollection,
    id: string
): TToolPanel | undefined {
    const comp = beans.sideBar?.comp.getToolPanelInstance(id);
    return _unwrapUserComp(comp) as any;
}

export function getSideBar(beans: _BeanCollection): SideBarDef | undefined {
    return beans.sideBar?.comp.getDef();
}
