import type { MockInstance } from 'vitest';

import type { Module } from 'ag-grid-community';
import { AllCommunityModule, createGrid } from 'ag-grid-community';

function findModuleByName(moduleName: string, module: Module, visited: Set<string> = new Set()): Module | undefined {
    if (visited.has(module.moduleName)) {
        return undefined;
    }
    visited.add(module.moduleName);

    if (module.moduleName === moduleName) {
        return module;
    }

    if (module.dependsOn) {
        for (const dep of module.dependsOn) {
            const found = findModuleByName(moduleName, dep, visited);
            if (found) {
                return found;
            }
        }
    }

    return undefined;
}

describe('core bundled modules', () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        document.body.innerHTML = '<div id="myGrid"></div>';
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    test('a grid renders client-side rows when no modules are registered', () => {
        createGrid(document.getElementById('myGrid')!, {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [
                { a: 1, b: 2 },
                { a: 3, b: 4 },
                { a: 5, b: 6 },
            ],
        });

        // ClientSideRowModelModule is bundled into the core, so the grid initialises and renders
        // the provided rowData without the user registering any modules.
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        // One header row plus three data rows.
        expect(document.querySelectorAll('[role="row"]')).toHaveLength(4);
        // Three rows of two columns.
        expect(document.querySelectorAll('[role="gridcell"]')).toHaveLength(6);
    });

    test('AllCommunityModule does not bundle the ValidationModule', () => {
        // Validations are opt-in via enableDevValidations() so production bundles stay smaller; the
        // ValidationModule must not be pulled in by AllCommunityModule.
        expect(findModuleByName('Validation', AllCommunityModule)).toBeUndefined();
        // Sanity check the traversal: the client-side row model is part of AllCommunityModule.
        expect(findModuleByName('ClientSideRowModel', AllCommunityModule)).toBeDefined();
    });
});
