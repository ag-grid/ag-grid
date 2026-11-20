import type { MockInstance } from 'vitest';

import { AllCommunityModule } from '../allCommunityModule';
import type { GridOptions } from '../entities/gridOptions';
import { createGrid } from '../grid';

class LegacyFilter {
    private readonly gui = document.createElement('div');
    public init(): void {}
    public getGui(): HTMLElement {
        return this.gui;
    }
    public isFilterActive(): boolean {
        return false;
    }
    public doesFilterPass(): boolean {
        return true;
    }
    public getModel(): null {
        return null;
    }
    public setModel(): void {}
}

// A package test: without the ValidationModule, as a production build runs.
describe('legacy filter mode warnings in production', () => {
    let consoleWarnSpy: MockInstance;

    const createGrids = (options: GridOptions) => {
        for (const id of ['grid1', 'grid2']) {
            createGrid(document.getElementById(id)!, options, { modules: [AllCommunityModule] });
        }
    };
    const legacyWarnings = () =>
        consoleWarnSpy.mock.calls.map((args) => args.join(' ')).filter((text) => /warning #34[3-8]/.test(text));

    beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        document.body.innerHTML = '<div id="grid1"></div><div id="grid2"></div>';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // First: the console de-dupe would otherwise hide a 343 logged here.
    test('`enableFilterHandlers: false` logs nothing', () => {
        createGrids({
            enableFilterHandlers: false,
            columnDefs: [{ field: 'name', filter: LegacyFilter }],
            rowData: [],
        });

        expect(legacyWarnings()).toEqual([]);
    });

    test('a legacy custom filter logs the short form with a link', () => {
        createGrids({ columnDefs: [{ field: 'name', filter: LegacyFilter }], rowData: [] });

        const warnings = legacyWarnings();
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain('warning #343');
        expect(warnings[0]).toContain('/javascript-data-grid/errors/343');
    });
});
