'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import type { ColDef, GridOptions } from '@ag-grid-community/core';
import { createGrid } from '@ag-grid-community/core';
import {
    colorSchemeDarkBlue,
    colorSchemeDarkNeutral,
    colorSchemeDarkWarm,
    colorSchemeLightCold,
    colorSchemeLightNeutral,
    colorSchemeLightWarm,
    iconSetAlpine,
    iconSetMaterial,
    iconSetQuartzBold,
    iconSetQuartzLight,
    iconSetQuartzRegular,
    themeBalham,
    themeMaterial,
    themeQuartz,
} from '@ag-grid-community/theming';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    SideBarModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
]);

const baseThemes = [themeQuartz, themeBalham, themeMaterial];
let baseTheme = baseThemes[0];

const colorSchemes = [
    null,
    colorSchemeLightNeutral,
    colorSchemeLightCold,
    colorSchemeLightWarm,
    colorSchemeDarkNeutral,
    colorSchemeDarkWarm,
    colorSchemeDarkBlue,
];
let colorScheme = colorSchemes[0];

const iconSets = [null, iconSetQuartzLight, iconSetQuartzRegular, iconSetQuartzBold, iconSetAlpine, iconSetMaterial];
let iconSet = iconSets[0];

const columnDefs: ColDef[] = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

const rowData: any[] = (() => {
    const rowData: any[] = [];
    for (let i = 0; i < 10; i++) {
        rowData.push({ make: 'Toyota', model: 'Celica', price: 35000 + i * 1000 });
        rowData.push({ make: 'Ford', model: 'Mondeo', price: 32000 + i * 1000 });
        rowData.push({ make: 'Porsche', model: 'Boxster', price: 72000 + i * 1000 });
    }
    return rowData;
})();

const defaultColDef = {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
};

const gridOptions: GridOptions<IOlympicData> = {
    theme: buildTheme(),
    columnDefs,
    rowData,
    defaultColDef,
    sideBar: true,
};

const gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

function setBaseTheme(id: string) {
    baseTheme = baseThemes.find((theme) => theme.id === id)!;
    gridApi.setGridOption('theme', buildTheme());
}

function setIconSet(id: string) {
    iconSet = iconSets.find((theme) => theme?.id === id) || null;
    gridApi.setGridOption('theme', buildTheme());
}

function setColorScheme(id: string) {
    colorScheme = colorSchemes.find((theme) => theme?.id === id) || null;
    gridApi.setGridOption('theme', buildTheme());
}

function buildTheme() {
    let theme = baseTheme;
    if (iconSet) {
        theme = baseTheme.with(iconSet);
    }
    if (colorScheme) {
        theme = baseTheme.with(colorScheme);
    }
    return theme;
}
