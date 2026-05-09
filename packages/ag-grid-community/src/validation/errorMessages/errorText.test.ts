import { VanillaFrameworkOverrides } from '../../vanillaFrameworkOverrides';
import { AG_GRID_ERRORS, NoModulesRegisteredError } from './errorText';

describe('Validate AG_GRID_ERRORS', () => {
    // eslint-disable-next-line no-restricted-properties
    test.each(Object.entries(AG_GRID_ERRORS))(
        'Calling with no params should not throw for Astro generation: ErrorKey=%i',
        (key, errorTextFn) => {
            errorTextFn({} as any);
        }
    );
});

describe('NoModulesRegisteredError', () => {
    test('shows AgGridProvider snippet when usesAgGridProvider is true', () => {
        expect(NoModulesRegisteredError(true)).toMatchInlineSnapshot(`
"No AG Grid modules are registered! It is recommended to start with all Community features via the AllCommunityModule:

import { AgGridProvider, AgGridReact } from 'ag-grid-react'; 
import { AllCommunityModule } from 'ag-grid-community';

const modules = [ AllCommunityModule ];

function App() {
    return (
        <AgGridProvider modules={modules}>
            <AgGridReact /* ... props */ />
        </AgGridProvider>
    );
}
"
`);
    });

    test('shows AgGridProvider snippet for React users without AgGridProvider (guides new users toward AgGridProvider)', () => {
        expect(NoModulesRegisteredError(false)).toMatchInlineSnapshot(`
"No AG Grid modules are registered! It is recommended to start with all Community features via the AllCommunityModule:

import { AgGridProvider, AgGridReact } from 'ag-grid-react'; 
import { AllCommunityModule } from 'ag-grid-community';

const modules = [ AllCommunityModule ];

function App() {
    return (
        <AgGridProvider modules={modules}>
            <AgGridReact /* ... props */ />
        </AgGridProvider>
    );
}
"
`);
    });

    test('shows ModuleRegistry snippet when usesAgGridProvider is undefined (non-React)', () => {
        expect(NoModulesRegisteredError()).toMatchInlineSnapshot(`
"No AG Grid modules are registered! It is recommended to start with all Community features via the AllCommunityModule:

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ AllCommunityModule ]);
"
`);
    });

    test('shows ModuleRegistry snippet for plain JS (VanillaFrameworkOverrides sets undefined)', () => {
        // VanillaFrameworkOverrides.usesAgGridProvider must be undefined, not false,
        // so that plain JS users see the ModuleRegistry approach
        const vanillaUsesAgGridProvider = new VanillaFrameworkOverrides().usesAgGridProvider;
        expect(NoModulesRegisteredError(vanillaUsesAgGridProvider)).toMatchInlineSnapshot(`
"No AG Grid modules are registered! It is recommended to start with all Community features via the AllCommunityModule:

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ AllCommunityModule ]);
"
`);
    });
});

describe('error 200 (missing module)', () => {
    test('shows AgGridProvider snippet when usesAgGridProvider is true', () => {
        expect(
            AG_GRID_ERRORS[200]({
                reasonOrId: 'Test feature',
                moduleName: 'RowSelection',
                gridScoped: false,
                gridId: 'myGrid',
                rowModelType: 'clientSide',
                usesAgGridProvider: true,
            })
        ).toMatchInlineSnapshot(`
"Unable to use Test feature as RowSelectionModule is not registered.  Check if you have registered the module:

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

For more info see: https://www.ag-grid.com/archive/35.3.0/javascript-data-grid/modules/"
`);
    });

    test('shows ModuleRegistry snippet for React users using ModuleRegistry (without AgGridProvider)', () => {
        expect(
            AG_GRID_ERRORS[200]({
                reasonOrId: 'Test feature',
                moduleName: 'RowSelection',
                gridScoped: false,
                gridId: 'myGrid',
                rowModelType: 'clientSide',
                usesAgGridProvider: false,
            })
        ).toMatchInlineSnapshot(`
"Unable to use Test feature as RowSelectionModule is not registered.  Check if you have registered the module:

import { ModuleRegistry } from 'ag-grid-community'; 
import { RowSelectionModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ RowSelectionModule ]);

For more info see: https://www.ag-grid.com/archive/35.3.0/javascript-data-grid/modules/"
`);
    });
});

describe('error 260 (missing user component)', () => {
    test('formats missing component error with usesAgGridProvider', () => {
        expect(
            AG_GRID_ERRORS[260]({
                propName: 'cellEditor',
                compName: 'agRichSelectCellEditor',
                gridScoped: false,
                gridId: 'myGrid',
                rowModelType: 'clientSide',
                usesAgGridProvider: true,
            })
        ).toMatchInlineSnapshot(`
"Unable to use AG Grid 'cellEditor' component: agRichSelectCellEditor as RichSelectModule is not registered.  Check if you have registered the module:

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

For more info see: https://www.ag-grid.com/archive/35.3.0/javascript-data-grid/modules/"
`);
    });

    test('formats missing component error for React using ModuleRegistry (without AgGridProvider)', () => {
        expect(
            AG_GRID_ERRORS[260]({
                propName: 'cellEditor',
                compName: 'agRichSelectCellEditor',
                gridScoped: false,
                gridId: 'myGrid',
                rowModelType: 'clientSide',
                usesAgGridProvider: false,
            })
        ).toMatchInlineSnapshot(`
"Unable to use AG Grid 'cellEditor' component: agRichSelectCellEditor as RichSelectModule is not registered.  Check if you have registered the module:

import { ModuleRegistry } from 'ag-grid-community'; 
import { RichSelectModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ RichSelectModule ]);

For more info see: https://www.ag-grid.com/archive/35.3.0/javascript-data-grid/modules/"
`);
    });
});
