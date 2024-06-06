import type { BeanCollection, GridApi, IToolPanel, SideBarDef } from '@ag-grid-community/core';
import { ModuleNames, ModuleRegistry, _unwrapUserComp } from '@ag-grid-community/core';

function assertSideBarLoaded(beans: BeanCollection, apiMethod: keyof GridApi): boolean {
    return ModuleRegistry.__assertRegistered(ModuleNames.SideBarModule, 'api.' + apiMethod, beans.context.getGridId());
}

export function isSideBarVisible(beans: BeanCollection): boolean {
    return assertSideBarLoaded(beans, 'isSideBarVisible') && beans.sideBarService!.getSideBarComp().isDisplayed();
}

export function setSideBarVisible(beans: BeanCollection, show: boolean) {
    if (assertSideBarLoaded(beans, 'setSideBarVisible')) {
        beans.sideBarService!.getSideBarComp().setDisplayed(show);
    }
}

export function setSideBarPosition(beans: BeanCollection, position: 'left' | 'right') {
    if (assertSideBarLoaded(beans, 'setSideBarPosition')) {
        beans.sideBarService!.getSideBarComp().setSideBarPosition(position);
    }
}

export function openToolPanel(beans: BeanCollection, key: string) {
    if (assertSideBarLoaded(beans, 'openToolPanel')) {
        beans.sideBarService!.getSideBarComp().openToolPanel(key, 'api');
    }
}

export function closeToolPanel(beans: BeanCollection) {
    if (assertSideBarLoaded(beans, 'closeToolPanel')) {
        beans.sideBarService!.getSideBarComp().close('api');
    }
}

export function getOpenedToolPanel(beans: BeanCollection): string | null {
    if (assertSideBarLoaded(beans, 'getOpenedToolPanel')) {
        return beans.sideBarService!.getSideBarComp().openedItem();
    }
    return null;
}

export function refreshToolPanel(beans: BeanCollection): void {
    if (assertSideBarLoaded(beans, 'refreshToolPanel')) {
        beans.sideBarService!.getSideBarComp().refresh();
    }
}

export function isToolPanelShowing(beans: BeanCollection): boolean {
    return (
        assertSideBarLoaded(beans, 'isToolPanelShowing') && beans.sideBarService!.getSideBarComp().isToolPanelShowing()
    );
}

export function getToolPanelInstance<TToolPanel = IToolPanel>(
    beans: BeanCollection,
    id: string
): TToolPanel | undefined {
    if (assertSideBarLoaded(beans, 'getToolPanelInstance')) {
        const comp = beans.sideBarService!.getSideBarComp().getToolPanelInstance(id);
        return _unwrapUserComp(comp) as any;
    }
}

export function getSideBar(beans: BeanCollection): SideBarDef | undefined {
    if (assertSideBarLoaded(beans, 'getSideBar')) {
        return beans.sideBarService!.getSideBarComp().getDef();
    }
    return undefined;
}
