import type { GridOptionsService, SideBarDef, ToolbarItemComponentName, _ModuleWithoutApi } from 'ag-grid-community';
import { _KeyboardNavigationModule, _resetColumnState, _warn } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import type { ColumnChooserFactory } from '../menu/columnChooserFactory';
import { VERSION } from '../version';
import { AgToolbarSelector } from './agToolbar';
import { createToolbarButton } from './providedItems/createToolbarButton';
import { FindToolbarItem } from './providedItems/findToolbarItem';
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
    return !!sideBar.toolPanels?.some((p) => (typeof p === 'string' ? p : p.id) === panelId);
}

const AutoSizeAllToolbarItem = createToolbarButton({
    icon: 'maximize',
    localeKey: 'autosizeAllColumns',
    defaultLabel: 'Autosize All Columns',
    onAction: (beans) => beans.colAutosize?.autoSizeAllColumns({ source: 'api' }),
});

const ColumnChooserToolbarItem = createToolbarButton({
    icon: 'columns',
    localeKey: 'columnChooser',
    defaultLabel: 'Choose Columns',
    onAction: (beans, eGui) =>
        (beans.colChooserFactory as ColumnChooserFactory)?.showColumnChooser({ eventSource: eGui }),
    onInit: (comp, gos) => {
        const hasColumnMenu = gos.isModuleRegistered('ColumnMenu');
        if (!hasColumnMenu) {
            _warn(302, { itemName: 'columnChooser', moduleName: 'ColumnMenu', ...gos.getModuleErrorParams() });
        }
        comp.setDisplayed(hasColumnMenu);
    },
    shouldDisplay: (gos) => gos.isModuleRegistered('ColumnMenu'),
});

function canShowColumnsPanel(gos: GridOptionsService): boolean {
    const hasSideBar = gos.isModuleRegistered('SideBar');
    const hasColumnsToolPanel = gos.isModuleRegistered('ColumnsToolPanel');
    return hasSideBar && hasColumnsToolPanel && hasSideBarPanel(gos.get('sideBar'), 'columns');
}

const ColumnsPanelToolbarItem = createToolbarButton({
    icon: 'columnsToolPanel',
    localeKey: 'columns',
    defaultLabel: 'Columns',
    onAction: (beans) => {
        const sideBarComp = beans.sideBar?.comp;
        if (!sideBarComp) {
            return;
        }
        if (sideBarComp.openedItem() === 'columns') {
            sideBarComp.close('api');
        } else {
            sideBarComp.openToolPanel('columns', 'api');
        }
    },
    onInit: (comp, gos) => {
        const hasSideBar = gos.isModuleRegistered('SideBar');
        const hasColumnsToolPanel = gos.isModuleRegistered('ColumnsToolPanel');
        if (!hasSideBar || !hasColumnsToolPanel) {
            _warn(302, {
                itemName: 'columnsPanel',
                moduleName: ['SideBar', 'ColumnsToolPanel'],
                ...gos.getModuleErrorParams(),
            });
        } else if (!hasSideBarPanel(gos.get('sideBar'), 'columns')) {
            _warn(299);
        }
        comp.setDisplayed(canShowColumnsPanel(gos));
    },
    shouldDisplay: (gos) => canShowColumnsPanel(gos),
});

const CsvExportToolbarItem = createToolbarButton({
    icon: 'csvExport',
    localeKey: 'csvExport',
    defaultLabel: 'CSV Export',
    onAction: (beans) => beans.csvCreator?.exportDataAsCsv(),
    onInit: (comp, gos) => {
        const hasCsvExport = gos.isModuleRegistered('CsvExport');
        if (!hasCsvExport) {
            _warn(302, { itemName: 'csvExport', moduleName: 'CsvExport', ...gos.getModuleErrorParams() });
        }
        comp.setDisplayed(hasCsvExport && !gos.get('suppressCsvExport'));
    },
    shouldDisplay: (gos) => gos.isModuleRegistered('CsvExport') && !gos.get('suppressCsvExport'),
});

const ExcelExportToolbarItem = createToolbarButton({
    icon: 'excelExport',
    localeKey: 'excelExport',
    defaultLabel: 'Excel Export',
    onAction: (beans) => beans.excelCreator?.exportDataAsExcel(),
    onInit: (comp, gos) => {
        const hasExcelExport = gos.isModuleRegistered('ExcelExport');
        if (!hasExcelExport) {
            _warn(302, { itemName: 'excelExport', moduleName: 'ExcelExport', ...gos.getModuleErrorParams() });
        }
        comp.setDisplayed(hasExcelExport && !gos.get('suppressExcelExport'));
    },
    shouldDisplay: (gos) => gos.isModuleRegistered('ExcelExport') && !gos.get('suppressExcelExport'),
});

function canShowFiltersPanel(gos: GridOptionsService): boolean {
    const hasSideBar = gos.isModuleRegistered('SideBar');
    const hasFiltersToolPanel = gos.isModuleRegistered('FiltersToolPanel');
    const hasNewFiltersToolPanel = gos.isModuleRegistered('NewFiltersToolPanel');
    const hasFilterModule = hasFiltersToolPanel || hasNewFiltersToolPanel;
    return (
        hasSideBar &&
        hasFilterModule &&
        ['filters', 'filters-new'].some((id) => hasSideBarPanel(gos.get('sideBar'), id))
    );
}

const FiltersPanelToolbarItem = createToolbarButton({
    icon: 'filtersToolPanel',
    localeKey: 'filters',
    defaultLabel: 'Filters',
    onAction: (beans, _eGui, gos) => {
        const sideBarComp = beans.sideBar?.comp;
        if (!sideBarComp) {
            return;
        }
        const panelId = ['filters', 'filters-new'].find((id) => hasSideBarPanel(gos.get('sideBar'), id));
        if (!panelId) {
            return;
        }
        if (sideBarComp.openedItem() === panelId) {
            sideBarComp.close('api');
        } else {
            sideBarComp.openToolPanel(panelId, 'api');
        }
    },
    onInit: (comp, gos) => {
        const hasSideBar = gos.isModuleRegistered('SideBar');
        const hasFiltersToolPanel = gos.isModuleRegistered('FiltersToolPanel');
        const hasNewFiltersToolPanel = gos.isModuleRegistered('NewFiltersToolPanel');
        const hasFilterModule = hasFiltersToolPanel || hasNewFiltersToolPanel;
        if (!hasSideBar || !hasFilterModule) {
            _warn(302, {
                itemName: 'filtersPanel',
                moduleName: ['SideBar', 'FiltersToolPanel', 'NewFiltersToolPanel'],
                ...gos.getModuleErrorParams(),
            });
        } else if (!['filters', 'filters-new'].some((id) => hasSideBarPanel(gos.get('sideBar'), id))) {
            _warn(300);
        }
        comp.setDisplayed(canShowFiltersPanel(gos));
    },
    shouldDisplay: (gos) => canShowFiltersPanel(gos),
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
