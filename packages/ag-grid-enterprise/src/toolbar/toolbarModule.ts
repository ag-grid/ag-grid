import type { SideBarDef, ToolbarItemComponentName, _ModuleWithoutApi } from 'ag-grid-community';
import { _KeyboardNavigationModule, _resetColumnState, _warn } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import type { ColumnChooserFactory } from '../menu/columnChooserFactory';
import { VERSION } from '../version';
import { AgToolbarSelector } from './agToolbar';
import { createToolbarButton } from './providedItems/createToolbarButton';
import { FindToolbarItem } from './providedItems/findToolbarItem';
import { MenuToolbarItem } from './providedItems/menuToolbarItem';
import { PivotPanelToolbarItem } from './providedItems/pivotPanelToolbarItem';
import { QuickFilterToolbarItem } from './providedItems/quickFilterToolbarItem';
import { RowGroupPanelToolbarItem } from './providedItems/rowGroupPanelToolbarItem';

function hasSideBarPanel(
    sideBar: boolean | string | string[] | SideBarDef | null | undefined,
    panelId: string
): boolean {
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

const AutoSizeAllToolbarItem = createToolbarButton({
    icon: 'maximize',
    localeKey: 'autosizeAllColumns',
    defaultLabel: 'Autosize All Columns',
    onAction: (beans) => beans.gridApi.autoSizeAllColumns(),
});

const ColumnChooserToolbarItem = createToolbarButton({
    icon: 'columns',
    localeKey: 'columnChooser',
    defaultLabel: 'Choose Columns',
    onAction: (beans, eGui) =>
        (beans.colChooserFactory as ColumnChooserFactory | undefined)?.showColumnChooser({ eventSource: eGui }),
});

const ColumnsPanelToolbarItem = createToolbarButton({
    icon: 'columnsToolPanel',
    localeKey: 'columns',
    defaultLabel: 'Columns',
    onAction: (beans) => {
        const { gridApi } = beans;
        if (gridApi.getOpenedToolPanel() === 'columns') {
            gridApi.closeToolPanel();
        } else {
            gridApi.openToolPanel('columns');
        }
    },
    onInit: (comp, gos) => {
        if (!gos.isModuleRegistered('SideBar') || !gos.isModuleRegistered('ColumnsToolPanel')) {
            _warn(303, { itemName: 'columnsPanel', moduleName: 'SideBar and ColumnsToolPanel' });
            comp.setDisplayed(false);
        } else if (!hasSideBarPanel(gos.get('sideBar'), 'columns')) {
            _warn(299);
            comp.setDisplayed(false);
        }
    },
});

const CsvExportToolbarItem = createToolbarButton({
    icon: 'csvExport',
    localeKey: 'csvExport',
    defaultLabel: 'CSV Export',
    onAction: (beans) => beans.gridApi.exportDataAsCsv(),
    onInit: (comp, gos) => {
        if (!gos.isModuleRegistered('CsvExport')) {
            _warn(303, { itemName: 'csvExport', moduleName: 'CsvExport' });
            comp.setDisplayed(false);
        } else if (gos.get('suppressCsvExport')) {
            comp.setDisplayed(false);
        }
    },
});

const ExcelExportToolbarItem = createToolbarButton({
    icon: 'excelExport',
    localeKey: 'excelExport',
    defaultLabel: 'Excel Export',
    onAction: (beans) => beans.gridApi.exportDataAsExcel(),
    onInit: (comp, gos) => {
        if (!gos.isModuleRegistered('ExcelExport')) {
            _warn(303, { itemName: 'excelExport', moduleName: 'ExcelExport' });
            comp.setDisplayed(false);
        } else if (gos.get('suppressExcelExport')) {
            comp.setDisplayed(false);
        }
    },
});

const FiltersPanelToolbarItem = createToolbarButton({
    icon: 'filtersToolPanel',
    localeKey: 'filters',
    defaultLabel: 'Filters',
    onAction: (beans, _eGui, gos) => {
        const { gridApi } = beans;
        const panelId = ['filters', 'filters-new'].find((id) => hasSideBarPanel(gos.get('sideBar'), id));
        if (!panelId) {
            return;
        }
        if (gridApi.getOpenedToolPanel() === panelId) {
            gridApi.closeToolPanel();
        } else {
            gridApi.openToolPanel(panelId);
        }
    },
    onInit: (comp, gos) => {
        if (!gos.isModuleRegistered('SideBar') || !gos.isModuleRegistered('FiltersToolPanel')) {
            _warn(303, { itemName: 'filtersPanel', moduleName: 'SideBar and FiltersToolPanel' });
            comp.setDisplayed(false);
        } else if (!['filters', 'filters-new'].some((id) => hasSideBarPanel(gos.get('sideBar'), id))) {
            _warn(300);
            comp.setDisplayed(false);
        }
    },
});

const ResetColumnsToolbarItem = createToolbarButton({
    icon: 'minimize',
    localeKey: 'resetColumns',
    defaultLabel: 'Reset Columns',
    onAction: (beans) => _resetColumnState(beans, 'api'),
});

/**
 * @feature Accessories -> Toolbar
 * @gridOption toolbar
 */
export const ToolbarModule: _ModuleWithoutApi = {
    moduleName: 'Toolbar',
    version: VERSION,
    userComponents: {
        agAutoSizeAllToolbarItem: AutoSizeAllToolbarItem,
        agColumnChooserToolbarItem: ColumnChooserToolbarItem,
        agColumnsPanelToolbarItem: ColumnsPanelToolbarItem,
        agCsvExportToolbarItem: CsvExportToolbarItem,
        agExcelExportToolbarItem: ExcelExportToolbarItem,
        agFiltersPanelToolbarItem: FiltersPanelToolbarItem,
        agMenuToolbarItem: MenuToolbarItem,
        agFindToolbarItem: FindToolbarItem,
        agPivotPanelToolbarItem: PivotPanelToolbarItem,
        agQuickFilterToolbarItem: QuickFilterToolbarItem,
        agResetColumnsToolbarItem: ResetColumnsToolbarItem,
        agRowGroupPanelToolbarItem: RowGroupPanelToolbarItem,
    } satisfies Record<ToolbarItemComponentName, any>,
    icons: {
        filter: 'filter',
    },
    selectors: [AgToolbarSelector],
    dependsOn: [EnterpriseCoreModule, _KeyboardNavigationModule],
};
