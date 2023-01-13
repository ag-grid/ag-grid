/**
 * Hero Grid demo
 */

// NOTE: Only typescript types should be imported from the AG Grid packages
// to prevent AG Grid from loading the code twice
import { GetRowIdParams, GridOptions } from 'ag-grid-community';
import { columnDefs, generateStocks, generateStockUpdate } from './data';
import { createGenerator } from './generator-utils';

const UPDATE_INTERVAL = 100;

const rowData = generateStocks();
const generator = createGenerator({
    interval: UPDATE_INTERVAL,
    callback: () => {
        if (!gridOptions.api) {
            return;
        }

        const randomIndex = Math.floor(Math.random() * rowData.length);
        const stockToUpdate = rowData[randomIndex];
        const newStock = generateStockUpdate(stockToUpdate);

        rowData[randomIndex] = newStock;
        gridOptions.api.applyTransactionAsync(
            {
                update: [newStock],
            },
            () => {
                const rowNode = gridOptions.api!.getRowNode(newStock.stock)!;
                gridOptions?.api?.flashCells({
                    rowNodes: [rowNode],
                    columns: ['current'],
                });
            }
        );
    },
});

const gridOptions: GridOptions = {
    columnDefs,
    rowData,
    rowHeight: 40,
    headerHeight: 30,
    defaultColDef: {
        resizable: true,
        sortable: true,
    },
    getRowId: ({ data }: GetRowIdParams) => {
        return data.stock;
    },
    onGridReady() {
        generator.start();
    },
};

/*
 * Initialise the grid using plain JavaScript, so grid can be dynamically loaded.
*/
export function initGrid(selector: string) {
    const init = () => {
        const gridDiv = document.querySelector(selector);
        new agGrid.Grid(gridDiv, gridOptions);
    };

    const loadGrid = function () {
        if (document.querySelector(selector) && window.agGrid) {
            init();
        } else {
            requestAnimationFrame(() => loadGrid())
        }
    };

    loadGrid();
}
