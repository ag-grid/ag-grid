/**
 * Hero Grid demo
 */

// NOTE: Only typescript types should be imported from the AG Grid packages
// to prevent AG Grid from loading the code twice
import { GetRowIdParams, GridOptions, GridSizeChangedEvent, ISetFilter } from 'ag-grid-community';
import { columnDefs, generateStocks, generateStockUpdate } from './data';
import { createGenerator } from './generator-utils';

const UPDATE_INTERVAL = 60;
const COLUMN_ID_PRIORITIES = [
    "stock",
    "timeline",
    "percentageChange",
    "current",
    "last"
];
const FILTER_ROWS_BREAKPOINT = 550;

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
            }
        );
    },
});

const gridOptions: GridOptions = {
    columnDefs,
    rowData,
    rowHeight: 48,
    headerHeight: 30,
    defaultColDef: {
        resizable: true,
        sortable: true,
    },
    domLayout: 'autoHeight',
    getRowId: ({ data }: GetRowIdParams) => {
        return data.stock;
    },
    onGridReady() {
        generator.start();
    },
    onGridSizeChanged(params: GridSizeChangedEvent) {
        const columnsToShow: string[] = [];
        const columnsToHide: string[] = [];
        let totalWidth: number = 0;
        COLUMN_ID_PRIORITIES.forEach((colId) => {
            const col = params.columnApi.getColumn(colId);
            const minWidth = col?.getMinWidth() || 0;
            const newTotalWidth = totalWidth + minWidth;

            if (newTotalWidth <= params.clientWidth) {
                columnsToShow.push(colId);
                totalWidth = newTotalWidth;
            } else {
                columnsToHide.push(colId);
            }
        });

        // show/hide columns based on current grid width
        params.columnApi.setColumnsVisible(columnsToShow, true);
        params.columnApi.setColumnsVisible(columnsToHide, false);

        const stockFilter: ISetFilter = params.api.getFilterInstance('stock')!;
        const stocks = stockFilter.getFilterValues();
        if (params.clientWidth <= FILTER_ROWS_BREAKPOINT) {
            stockFilter.setModel({
                values: stocks.slice(0, 6)
            });


        } else {
            stockFilter.setModel({
                values: stocks
            });
        }
        params.api.onFilterChanged();
    }
};

/*
 * Initialise the grid using plain JavaScript, so grid can be dynamically loaded.
*/
export function initGrid(selector: string) {
    const init = () => {
        const gridDiv = document.querySelector(selector);
        new globalThis.agGrid.Grid(gridDiv, gridOptions);
    };

    const loadGrid = function () {
        if (document.querySelector(selector) && globalThis.agGrid) {
            init();
        } else {
            requestAnimationFrame(() => loadGrid())
        }
    };

    loadGrid();
}

/**
 * Clean up between hot module replacement on dev server
 */
// @ts-ignore
if (import.meta.webpackHot) {
    // @ts-ignore
    import.meta.webpackHot.dispose(() => {
        generator.stop();
        gridOptions.api?.destroy();
    });
}