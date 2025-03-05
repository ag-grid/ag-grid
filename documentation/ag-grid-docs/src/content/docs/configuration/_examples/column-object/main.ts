import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([ColumnApiModule, ClientSideRowModelModule, ValidationModule /* Development Only */]);

const columnDefs: ColDef[] = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

// specify the data
const rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'BMW', model: 'M50', price: 60000 },
    { make: 'Aston Martin', model: 'DBX', price: 190000 },
];

function getAllColumns() {
    agLog.log(gridApi!.getColumns());
}

function getAllColumnIds() {
    const columns = gridApi!.getColumns();
    if (columns) {
        agLog.log(columns.map((col) => col.getColId()));
    }
}
let gridApi: GridApi;

// let the grid know which columns and what data to use
const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
    },
    rowData: rowData,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

/**
 * Logger implementation
 */

function safeStringify({ obj, space = 2 }: { obj: any; space?: number }) {
    const seen = new WeakSet();
    return JSON.stringify(
        obj,
        (_, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                seen.add(value);
            }
            return value;
        },
        space
    );
}

const createAgLog = ({ bufferSize }: { bufferSize: number }) => {
    const logContainer = document.getElementById('agLog');
    if (!logContainer) {
        console.error('No element with #agLog found');
        return;
    }

    const removeExcessEntries = () => {
        while (logContainer.children.length > bufferSize) {
            logContainer.removeChild(logContainer.lastChild!);
        }
    };

    const createEntry = (...args: any[]) => {
        const entry = document.createElement('div');
        entry.textContent = args
            .map((arg) => {
                if (typeof arg === 'string') {
                    return arg;
                }
                return safeStringify({ obj: arg });
            })
            .join(' ');

        return entry;
    };

    const log = (...args: any[]) => {
        const entry = createEntry(...args);
        logContainer.prepend(entry);
        removeExcessEntries();
    };

    return {
        log,
    };
};
// Need to declare this somewhere globally
const agLog = createAgLog({ bufferSize: 10 })!;
