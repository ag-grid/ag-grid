import { ALL_SEVERITIES, TestGridsManager } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, enableDevValidations } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

import { VERSION } from '../version';

describe('dev validation overlay versions', () => {
    const communityGrids = new TestGridsManager({
        modules: [ClientSideRowModelModule, ValidationModule],
    });
    const enterpriseGrids = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, ValidationModule],
    });
    let consoleWarnSpy: MockInstance;

    // A grid option that is not a recognised property; emits an "invalid property" warning at init.
    const withUnknownOption = (): GridOptions =>
        ({ columnDefs: [{ field: 'athlete' }], rowData: [], thisOptionDoesNotExist: true }) as unknown as GridOptions;

    const versionsFooterText = () => document.querySelector('.ag-overlay-error-versions')?.textContent;

    beforeEach(() => {
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        enableDevValidations({ showOverlayOn: ALL_SEVERITIES });
    });

    afterEach(() => {
        communityGrids.reset();
        enterpriseGrids.reset();
        consoleWarnSpy.mockRestore();
        vitest.unstubAllGlobals();
    });

    test('reports the community version in the panel footer', () => {
        communityGrids.createGrid('myGrid', withUnknownOption());

        expect(versionsFooterText()).toBe(`AG Grid Community=${VERSION}`);
    });

    test('reports the enterprise version too when an enterprise module is registered', () => {
        enterpriseGrids.createGrid('myGrid', withUnknownOption());

        expect(versionsFooterText()).toBe(`AG Grid Community=${VERSION}, AG Grid Enterprise=${VERSION}`);
    });

    test('leads the copied diagnostics with the versions', () => {
        communityGrids.createGrid('myGrid', withUnknownOption());

        const writeText = vitest.fn().mockResolvedValue(undefined);
        vitest.stubGlobal('navigator', { clipboard: { writeText } });

        document.querySelector<HTMLButtonElement>('.ag-overlay-error-copy')!.click();

        // Whoever (or whatever) reads a pasted diagnostic needs the build it came from first.
        expect(writeText.mock.calls[0][0].split('\n')[0]).toBe(`Version: AG Grid Community=${VERSION}`);
    });

    // Must be the last test in the file: a global module registration cannot be undone.
    test('ignores modules the application registers globally after this grid was created', () => {
        communityGrids.createGrid('myGrid', withUnknownOption());

        const lateModule: Module = { moduleName: 'EnterpriseCore', version: VERSION };
        ModuleRegistry.registerModules([lateModule]);

        const writeText = vitest.fn().mockResolvedValue(undefined);
        vitest.stubGlobal('navigator', { clipboard: { writeText } });
        document.querySelector<HTMLButtonElement>('.ag-overlay-error-copy')!.click();

        expect(versionsFooterText()).toBe(`AG Grid Community=${VERSION}`);
        expect(writeText.mock.calls[0][0].split('\n')[0]).toBe(`Version: AG Grid Community=${VERSION}`);
    });
});
