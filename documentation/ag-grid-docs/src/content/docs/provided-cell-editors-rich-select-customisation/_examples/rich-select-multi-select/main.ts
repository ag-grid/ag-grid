import type {
    ColDef,
    GridApi,
    GridOptions,
    IRichCellEditorParams,
    ValueFormatterParams,
    ValueParserParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextEditorModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

import { colors } from './colors';
import { ColourCellRenderer } from './colourCellRenderer_typescript';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([TextEditorModule, ClientSideRowModelModule, RichSelectModule]);

const valueFormatter = (params: ValueFormatterParams) => {
    const { value } = params;
    if (Array.isArray(value)) {
        return value.join(', ');
    }

    return value;
};

const valueParser = (params: ValueParserParams) => {
    const { newValue } = params;

    if (newValue == null || newValue === '') {
        return null;
    }

    if (Array.isArray(newValue)) {
        return newValue;
    }

    return params.newValue.split(',');
};

type MultiSelectExampleConfig = {
    allowTyping: boolean;
    suppressMultiSelectPillRenderer: boolean;
    useCustomCellRenderer: boolean;
};

const config: MultiSelectExampleConfig = {
    allowTyping: false,
    suppressMultiSelectPillRenderer: false,
    useCustomCellRenderer: false,
};

function getColumnDefs(exampleConfig: MultiSelectExampleConfig): ColDef[] {
    const { allowTyping, suppressMultiSelectPillRenderer, useCustomCellRenderer } = exampleConfig;

    return [
        {
            headerName: 'Colours',
            field: 'colors',
            cellRenderer: useCustomCellRenderer ? ColourCellRenderer : undefined,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
                values: colors,
                cellRenderer: useCustomCellRenderer ? ColourCellRenderer : undefined,
                allowTyping,
                suppressMultiSelectPillRenderer,
                multiSelect: true,
                searchType: 'matchAny',
                filterList: true,
                highlightMatch: true,
                valueListMaxHeight: 220,
            } as IRichCellEditorParams,
        },
    ];
}

function getRandomNumber(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const data = Array.from(Array(20).keys()).map(() => {
    const numberOfOptions = getRandomNumber(1, 4);

    const selectedOptions: string[] = [];

    for (let i = 0; i < numberOfOptions; i++) {
        const color = colors[getRandomNumber(0, colors.length - 1)];
        if (selectedOptions.indexOf(color) === -1) {
            selectedOptions.push(color);
        }
    }

    selectedOptions.sort();

    return { colors: selectedOptions };
});

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        flex: 1,
        editable: true,
        valueFormatter: valueFormatter,
        valueParser: valueParser,
    },
    columnDefs: getColumnDefs(config),
    rowData: data,
};

function getCheckboxValue(id: string): boolean {
    return document.querySelector<HTMLInputElement>(id)?.checked ?? false;
}

function applyExampleConfig(): void {
    config.allowTyping = getCheckboxValue('#allow-typing');
    config.suppressMultiSelectPillRenderer = getCheckboxValue('#suppress-multi-select-pill-renderer');
    config.useCustomCellRenderer = getCheckboxValue('#custom-cell-renderer');

    if (gridApi) {
        const activeEdit = gridApi.getEditingCells()[0];
        if (activeEdit) {
            gridApi.stopEditing();
        }

        gridApi.setGridOption('columnDefs', getColumnDefs(config));

        if (activeEdit) {
            requestAnimationFrame(() => {
                gridApi.startEditingCell({
                    rowIndex: activeEdit.rowIndex,
                    rowPinned: activeEdit.rowPinned,
                    colKey: 'colors',
                });
            });
        }
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
