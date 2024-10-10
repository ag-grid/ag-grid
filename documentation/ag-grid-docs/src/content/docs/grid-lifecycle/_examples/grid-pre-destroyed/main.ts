import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, GridApi, GridOptions, GridPreDestroyedEvent } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

import type { TAthlete } from './data';
import { getDataSet } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface ColumnWidth {
    field: string;
    width: number;
}

let columnWidths: Map<string, number> | undefined = undefined;

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'name', headerName: 'Athlete' },
        { field: 'medals.gold', headerName: 'Gold Medals' },
        { field: 'person.age', headerName: 'Age' },
    ],
    defaultColDef: {
        editable: true,
    },
    rowData: getDataSet(),
    onGridPreDestroyed: (params: GridPreDestroyedEvent<TAthlete>) => {
        const allColumns = params.api.getColumns();
        if (!allColumns) {
            return;
        }

        const currentColumnWidths = allColumns.map((column) => ({
            field: column.getColDef().field || '-',
            width: column.getActualWidth(),
        }));

        displayColumnsWidth(currentColumnWidths);
        columnWidths = new Map(currentColumnWidths.map((columnWidth) => [columnWidth.field, columnWidth.width]));
    },
};

const displayColumnsWidth = (values: ColumnWidth[]) => {
    const parentContainer = document.querySelector<HTMLElement>('#gridPreDestroyedState')!;
    const valuesContainer = parentContainer.querySelector<HTMLElement>('.values');
    if (!parentContainer || !valuesContainer) {
        return;
    }

    const html =
        '<ul>' +
        (values || []).map((value) => `<li>Field: ${value.field} | Width: ${value.width}px</li>`).join('') +
        '</ul>';

    parentContainer.style.display = 'block';
    valuesContainer.innerHTML = html;

    const exampleButtons = document.querySelector<HTMLElement>('#exampleButtons');
    exampleButtons!.style.display = 'none';
};

const pRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();

function updateColumnWidth() {
    if (!gridApi) {
        return;
    }

    const newWidths = gridApi.getColumns()!.map((column) => {
        return { key: column.getColId(), newWidth: Math.round((150 + pRandom() * 100) * 100) / 100 };
    });
    gridApi.setColumnWidths(newWidths);
}

function destroyGrid() {
    if (!gridApi) {
        return;
    }

    gridApi.destroy();
    gridApi = undefined;
}

function reloadGrid() {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    const updatedColDefs =
        gridOptions.columnDefs && columnWidths
            ? gridOptions.columnDefs.map((val) => {
                  const colDef = val as ColDef;
                  const result: ColDef = {
                      ...colDef,
                  };

                  if (colDef.field && columnWidths) {
                      const restoredWidth = columnWidths.get(colDef.field);
                      if (restoredWidth) {
                          result.width = restoredWidth;
                      }
                  }

                  return result;
              })
            : gridOptions.columnDefs;

    gridOptions.columnDefs = updatedColDefs;

    gridApi = createGrid(gridDiv, gridOptions);

    const parentContainer = document.querySelector<HTMLElement>('#gridPreDestroyedState');
    parentContainer!.style.display = 'none';

    const exampleButtons = document.querySelector<HTMLElement>('#exampleButtons');
    exampleButtons!.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
