'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import {
    colorSchemeDark,
    colorSchemeDarkBlue,
    colorSchemeDarkWarm,
    colorSchemeLight,
    colorSchemeLightCold,
    colorSchemeLightWarm,
    iconSetAlpine,
    iconSetMaterial,
    iconSetQuartzBold,
    iconSetQuartzLight,
    iconSetQuartzRegular,
    themeAlpine,
    themeBalham,
    themeQuartz,
} from '@ag-grid-community/theming';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';
import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    SideBarModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
]);

const baseThemes = [themeQuartz, themeBalham, themeAlpine];
const colorSchemes = [
    null,
    colorSchemeLight,
    colorSchemeLightCold,
    colorSchemeLightWarm,
    colorSchemeDark,
    colorSchemeDarkWarm,
    colorSchemeDarkBlue,
];
const iconSets = [null, iconSetQuartzLight, iconSetQuartzRegular, iconSetQuartzBold, iconSetAlpine, iconSetMaterial];

const GridExample = () => {
    const [baseTheme, setBaseTheme] = useState(baseThemes[0]);
    const [colorScheme, setColorScheme] = useState(colorSchemes[0]);
    const [iconSet, setIconSet] = useState(iconSets[0]);

    const theme = useMemo(() => {
        let theme = baseTheme;
        if (colorScheme) {
            theme = theme.with(colorScheme);
        }
        if (iconSet) {
            theme = theme.with(iconSet);
        }
        return theme;
    }, [baseTheme, colorScheme, iconSet]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <p style={{ flex: 0 }}>
                Theme: <PartSelector options={baseThemes} value={baseTheme} setValue={setBaseTheme} />
                Icons: <PartSelector options={iconSets} value={iconSet} setValue={setIconSet} />
                Color scheme: <PartSelector options={colorSchemes} value={colorScheme} setValue={setColorScheme} />
            </p>
            <div style={{ flex: 1 }}>
                <AgGridReact
                    theme={theme}
                    loadThemeGoogleFonts
                    columnDefs={columnDefs}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    sideBar
                />
            </div>
        </div>
    );
};

const PartSelector = ({ options, value, setValue }) => (
    <select
        onChange={(e) => setValue(options.find((t) => t?.id === e.currentTarget.value) || null)}
        style={{ marginRight: 16 }}
        value={value?.id}
    >
        {options.map((option, i) => (
            <option key={i} value={option?.id}>
                {option?.id.replace(/^.*\//, '') || '(unchanged)'}
            </option>
        ))}
    </select>
);

const rowData = (() => {
    const rowData = [];
    for (let i = 0; i < 10; i++) {
        rowData.push({ make: 'Toyota', model: 'Celica', price: 35000 + i * 1000 });
        rowData.push({ make: 'Ford', model: 'Mondeo', price: 32000 + i * 1000 });
        rowData.push({ make: 'Porsche', model: 'Boxster', price: 72000 + i * 1000 });
    }
    return rowData;
})();

const columnDefs = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

const defaultColDef = {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
};

const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
