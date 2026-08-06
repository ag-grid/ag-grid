/**
 * Companion to entry.mjs for the scope-hoisting check, executed in jsdom the same
 * way, which additionally proves every module still starts when all of them are
 * registered together.
 *
 * Registers everything, so nothing is eliminable and any growth measured against
 * this entry is structural: webpack's per-module wrappers, export getter blocks and
 * the property accesses that replace direct references when modules are not merged.
 * That separates "we regressed dead-code elimination" from "we added module
 * boundaries", which a single entry cannot distinguish.
 */
import { ModuleRegistry, createGrid, themeQuartz } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllEnterpriseModule]);

const container = document.createElement('div');
document.body.appendChild(container);

globalThis.__agScopeHoistingApi = createGrid(container, {
    theme: themeQuartz,
    columnDefs: [{ field: 'make', filter: 'agSetColumnFilter' }, { field: 'price' }],
    rowData: [
        { make: 'Tesla', price: 64950 },
        { make: 'Ford', price: 33850 },
        { make: 'Toyota', price: 29600 },
    ],
});
