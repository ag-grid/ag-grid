import { BASE_URL } from '../../baseUrl';
import { AG_GRID_ERRORS } from './errorText';

const trimTrailingSpaces = (s: string) => s.replace(/ +\n/g, '\n');

describe('Validate AG_GRID_ERRORS', () => {
    // eslint-disable-next-line no-restricted-properties
    test.each(Object.entries(AG_GRID_ERRORS))(
        'Calling with no params should not throw for Astro generation: ErrorKey=%i',
        (key, errorTextFn) => {
            errorTextFn({} as any);
        }
    );
});

describe('error 200 (missing module)', () => {
    test('shows AgGridProvider snippet when usesAgGridProvider is true', () => {
        expect(
            trimTrailingSpaces(
                AG_GRID_ERRORS[200]({
                    reasonOrId: 'Test feature',
                    moduleName: 'RowSelection',
                    gridScoped: false,
                    gridId: 'myGrid',
                    rowModelType: 'clientSide',
                    usesAgGridProvider: true,
                })
            )
        )
            .toEqual(`Unable to use \`Test feature\` as \`RowSelectionModule\` is not registered.  Check if you have registered the module:

import { AgGridProvider, AgGridReact } from 'ag-grid-react';
import { RowSelectionModule } from 'ag-grid-community';

const modules = [ RowSelectionModule ];

function App() {
    return (
        <AgGridProvider modules={modules}>
            <AgGridReact /* ... props */ />
        </AgGridProvider>
    );
}

For more info see: ${BASE_URL}/javascript-data-grid/modules/`);
    });

    test('recommends AgGridProvider for React users without an AgGridProvider', () => {
        expect(
            trimTrailingSpaces(
                AG_GRID_ERRORS[200]({
                    reasonOrId: 'Test feature',
                    moduleName: 'RowSelection',
                    gridScoped: false,
                    gridId: 'myGrid',
                    rowModelType: 'clientSide',
                    usesAgGridProvider: false,
                })
            )
        )
            .toEqual(`Unable to use \`Test feature\` as \`RowSelectionModule\` is not registered.  Check if you have registered the module:

import { AgGridProvider, AgGridReact } from 'ag-grid-react';
import { RowSelectionModule } from 'ag-grid-community';

const modules = [ RowSelectionModule ];

function App() {
    return (
        <AgGridProvider modules={modules}>
            <AgGridReact /* ... props */ />
        </AgGridProvider>
    );
}

For more info see: ${BASE_URL}/javascript-data-grid/modules/`);
    });

    test('shows ModuleRegistry snippet for non-React (usesAgGridProvider undefined)', () => {
        expect(
            trimTrailingSpaces(
                AG_GRID_ERRORS[200]({
                    reasonOrId: 'Test feature',
                    moduleName: 'RowSelection',
                    gridScoped: false,
                    gridId: 'myGrid',
                    rowModelType: 'clientSide',
                    usesAgGridProvider: undefined,
                })
            )
        )
            .toEqual(`Unable to use \`Test feature\` as \`RowSelectionModule\` is not registered.  Check if you have registered the module:

import { ModuleRegistry } from 'ag-grid-community';
import { RowSelectionModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ RowSelectionModule ]);

For more info see: ${BASE_URL}/javascript-data-grid/modules/`);
    });

    test('respects an explicit ModuleRegistry choice for React (usedModuleRegistry true)', () => {
        expect(
            trimTrailingSpaces(
                AG_GRID_ERRORS[200]({
                    reasonOrId: 'Test feature',
                    moduleName: 'RowSelection',
                    gridScoped: false,
                    gridId: 'myGrid',
                    rowModelType: 'clientSide',
                    usesAgGridProvider: false,
                    usedModuleRegistry: true,
                })
            )
        )
            .toEqual(`Unable to use \`Test feature\` as \`RowSelectionModule\` is not registered.  Check if you have registered the module:

import { ModuleRegistry } from 'ag-grid-community';
import { RowSelectionModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ RowSelectionModule ]);

For more info see: ${BASE_URL}/javascript-data-grid/modules/`);
    });
});

describe('error 260 (missing user component)', () => {
    test('formats missing component error with usesAgGridProvider', () => {
        expect(
            trimTrailingSpaces(
                AG_GRID_ERRORS[260]({
                    propName: 'cellEditor',
                    compName: 'agRichSelectCellEditor',
                    gridScoped: false,
                    gridId: 'myGrid',
                    rowModelType: 'clientSide',
                    usesAgGridProvider: true,
                })
            )
        )
            .toEqual(`Unable to use \`AG Grid 'cellEditor' component: agRichSelectCellEditor\` as \`RichSelectModule\` is not registered.  Check if you have registered the module:

import { AgGridProvider, AgGridReact } from 'ag-grid-react';
import { RichSelectModule } from 'ag-grid-enterprise';

const modules = [ RichSelectModule ];

function App() {
    return (
        <AgGridProvider modules={modules}>
            <AgGridReact /* ... props */ />
        </AgGridProvider>
    );
}

For more info see: ${BASE_URL}/javascript-data-grid/modules/`);
    });

    test('recommends AgGridProvider for React missing component without an AgGridProvider', () => {
        expect(
            trimTrailingSpaces(
                AG_GRID_ERRORS[260]({
                    propName: 'cellEditor',
                    compName: 'agRichSelectCellEditor',
                    gridScoped: false,
                    gridId: 'myGrid',
                    rowModelType: 'clientSide',
                    usesAgGridProvider: false,
                })
            )
        )
            .toEqual(`Unable to use \`AG Grid 'cellEditor' component: agRichSelectCellEditor\` as \`RichSelectModule\` is not registered.  Check if you have registered the module:

import { AgGridProvider, AgGridReact } from 'ag-grid-react';
import { RichSelectModule } from 'ag-grid-enterprise';

const modules = [ RichSelectModule ];

function App() {
    return (
        <AgGridProvider modules={modules}>
            <AgGridReact /* ... props */ />
        </AgGridProvider>
    );
}

For more info see: ${BASE_URL}/javascript-data-grid/modules/`);
    });

    test('shows ModuleRegistry snippet for non-React missing component (usesAgGridProvider undefined)', () => {
        expect(
            trimTrailingSpaces(
                AG_GRID_ERRORS[260]({
                    propName: 'cellEditor',
                    compName: 'agRichSelectCellEditor',
                    gridScoped: false,
                    gridId: 'myGrid',
                    rowModelType: 'clientSide',
                    usesAgGridProvider: undefined,
                })
            )
        )
            .toEqual(`Unable to use \`AG Grid 'cellEditor' component: agRichSelectCellEditor\` as \`RichSelectModule\` is not registered.  Check if you have registered the module:

import { ModuleRegistry } from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ RichSelectModule ]);

For more info see: ${BASE_URL}/javascript-data-grid/modules/`);
    });
});
