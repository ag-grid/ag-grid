import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, GridOptions } from 'ag-grid-community';
import { ModuleRegistry, createGrid } from 'ag-grid-community';
import { ClipboardModule } from 'ag-grid-enterprise';
import { ExcelExportModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

// Register shared Modules globally
ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule]);

const columnDefs: ColDef[] = [{ field: 'id' }, { field: 'color' }, { field: 'value1' }];
const defaultColDef = {
    flex: 1,
    minWidth: 100,
    filter: true,
    floatingFilter: true,
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

let rowIdSequence = 100;
function createRowBlock() {
    return ['Red', 'Green', 'Blue'].map((color) => ({
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(pRandom() * 100),
    }));
}

const baseGridOptions: GridOptions = {
    defaultColDef: defaultColDef,
    columnDefs: columnDefs,
};

const leftGridOptions: GridOptions = {
    ...baseGridOptions,
    rowData: createRowBlock(),
};

const rightGridOptions: GridOptions = {
    ...baseGridOptions,
    rowData: createRowBlock(),
};

function loadGrid(side: string) {
    const grid = document.querySelector<HTMLElement>('#e' + side + 'Grid')!;
    const modules = side === 'Left' ? [SetFilterModule, ClipboardModule] : [ExcelExportModule];
    createGrid(grid, side === 'Left' ? leftGridOptions : rightGridOptions, { modules: modules });
}

loadGrid('Left');
loadGrid('Right');
