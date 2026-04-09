import type { GridOptionsService, SideBarDef } from 'ag-grid-community';

export function hasSideBarPanel(gos: GridOptionsService, panelId: string): boolean {
    const sideBar = gos.get('sideBar');
    if (!sideBar) {
        return false;
    }
    if (sideBar === true) {
        return true;
    }
    if (typeof sideBar === 'string') {
        return sideBar === panelId;
    }
    if (Array.isArray(sideBar)) {
        return sideBar.includes(panelId);
    }
    return !!(sideBar as SideBarDef).toolPanels?.some((p) => (typeof p === 'string' ? p : p.id) === panelId);
}
