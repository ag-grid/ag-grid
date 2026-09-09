import { BASE_URL } from '../../baseUrl';
import { AG_GRID_ERRORS, MAX_ERROR_ID } from './errorText';

const trimTrailingSpaces = (s: string) => s.replace(/ +\n/g, '\n');

describe('Validate AG_GRID_ERRORS', () => {
    test.each(Object.entries(AG_GRID_ERRORS))(
        'Calling with no params should not throw for Astro generation: ErrorKey=%i',
        (key, errorTextFn) => {
            errorTextFn({} as any);
        }
    );

    test('MAX_ERROR_ID covers every error code, so the docs site generates a page for each', () => {
        const highestErrorId = Math.max(...Object.keys(AG_GRID_ERRORS).map(Number));

        expect(MAX_ERROR_ID).toBeGreaterThanOrEqual(highestErrorId);
    });
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
            .toEqual(`Unable to use Test feature as \`RowSelectionModule\` is not registered. Check if you have registered the module:

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

    test('shows ModuleRegistry snippet for React users using ModuleRegistry (without AgGridProvider)', () => {
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
            .toEqual(`Unable to use Test feature as \`RowSelectionModule\` is not registered. Check if you have registered the module:

import { ModuleRegistry, RowSelectionModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ RowSelectionModule ]);

For more info see: ${BASE_URL}/javascript-data-grid/modules/`);
    });

    test('combines batched reports into one message with a single consolidated snippet', () => {
        expect(
            trimTrailingSpaces(
                AG_GRID_ERRORS[200]({
                    reasonOrId: 'Test feature',
                    moduleName: 'RowSelection',
                    gridScoped: false,
                    gridId: 'myGrid',
                    rowModelType: 'clientSide',
                    usesAgGridProvider: false,
                    reports: [
                        { reasonOrId: '`enableValue`', moduleName: 'RowGrouping' },
                        { reasonOrId: 'icon `sortAscending`', moduleName: 'RowSelection' },
                    ],
                })
            )
        ).toEqual(`Unable to use \`enableValue\` as \`RowGroupingModule\` is not registered.
Unable to use icon \`sortAscending\` as \`RowSelectionModule\` is not registered.
Check if you have registered the modules:

import { ModuleRegistry, RowSelectionModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ RowGroupingModule, RowSelectionModule ]);

For more info see: ${BASE_URL}/javascript-data-grid/modules/`);
    });

    test('accepts JSON-encoded reports (the form that survives the error-page URL) and renders identically', () => {
        // combineMissingModuleParams encodes each report to a string so the array survives URL serialisation;
        // the docs error page passes those strings straight back in. Both forms must produce the same message.
        expect(
            trimTrailingSpaces(
                AG_GRID_ERRORS[200]({
                    reasonOrId: 'Test feature',
                    moduleName: 'RowSelection',
                    gridScoped: false,
                    gridId: 'myGrid',
                    rowModelType: 'clientSide',
                    usesAgGridProvider: false,
                    reports: [
                        JSON.stringify({ reasonOrId: '`enableValue`', moduleName: 'RowGrouping' }),
                        JSON.stringify({ reasonOrId: 'icon `sortAscending`', moduleName: 'RowSelection' }),
                    ],
                })
            )
        ).toEqual(`Unable to use \`enableValue\` as \`RowGroupingModule\` is not registered.
Unable to use icon \`sortAscending\` as \`RowSelectionModule\` is not registered.
Check if you have registered the modules:

import { ModuleRegistry, RowSelectionModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ RowGroupingModule, RowSelectionModule ]);

For more info see: ${BASE_URL}/javascript-data-grid/modules/`);
    });

    test("appends each batched report's additionalText once, after the snippet", () => {
        expect(
            trimTrailingSpaces(
                AG_GRID_ERRORS[200]({
                    reasonOrId: 'Test feature',
                    moduleName: 'RowSelection',
                    gridScoped: false,
                    gridId: 'myGrid',
                    rowModelType: 'clientSide',
                    reports: [
                        {
                            reasonOrId: 'icon `a`',
                            moduleName: 'RowSelection',
                            additionalText: 'Use the CSS icon name.',
                        },
                        {
                            reasonOrId: 'icon `b`',
                            moduleName: 'RowSelection',
                            additionalText: 'Use the CSS icon name.',
                        },
                    ],
                })
            )
        ).toEqual(`Unable to use icon \`a\` as \`RowSelectionModule\` is not registered.
Unable to use icon \`b\` as \`RowSelectionModule\` is not registered.
Check if you have registered the module:

import { ModuleRegistry, RowSelectionModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ RowSelectionModule ]);

For more info see: ${BASE_URL}/javascript-data-grid/modules/

Use the CSS icon name.`);
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
            .toEqual(`Unable to use AG Grid \`cellEditor\` component: \`agRichSelectCellEditor\` as \`RichSelectModule\` is not registered. Check if you have registered the module:

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

    test('formats missing component error for React using ModuleRegistry (without AgGridProvider)', () => {
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
            .toEqual(`Unable to use AG Grid \`cellEditor\` component: \`agRichSelectCellEditor\` as \`RichSelectModule\` is not registered. Check if you have registered the module:

import { ModuleRegistry } from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ RichSelectModule ]);

For more info see: ${BASE_URL}/javascript-data-grid/modules/`);
    });
});
