/**
 * Issue: with the default column header, an `innerHeaderComponent` is destroyed and recreated on every column
 * definition update instead of having its `refresh` called, so any state it holds is lost. `AgColumnHeader.refresh`
 * compares the template it would build with the current one by identity, and without a custom `template` it builds
 * a new object each time, so it always decides the template has changed and asks for the header to be recreated.
 *
 * Setup: a column with an inner header component that implements `refresh` and returns true. `columnDefs` is then
 * updated with a new `headerName`.
 *
 * Expected: the Column Headers docs (Refreshing Headers) say that a header component that still exists after a
 * column definition update has its `refresh` method called, and is only destroyed and recreated if `refresh`
 * returns false. So the same inner header instance is kept and refreshed with the new name.
 *
 * Actual: a new inner header instance is created and `refresh` is never called.
 *
 * Reported on: possibly React 36.0.0 and Angular 34.3.1 (searches below; not confirmed to be this cause).
 *
 * Source: found while investigating the Angular inner header refresh finding (`innerHeaderComponent.refresh.spec.ts`
 * in ag-grid-angular) for AG-18665, then matched to the docs MCP search log. A React 36.0.0 client in July 2026
 * searched "custom inner header component refresh lifecycle columnDefs new reference React rerender", and an Angular
 * 34.3.1 client in May 2026 searched "inner header component refresh when columnDefs change innerHeaderComponent"
 * and "IInnerHeaderAngularComp refresh method when not called".
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, GridApi, IHeaderParams, IInnerHeaderComponent } from 'ag-grid-community';
import { AgPromise, ClientSideRowModelModule } from 'ag-grid-community';

let refreshedWith: string[] = [];

class TestInnerHeader implements IInnerHeaderComponent {
    private readonly eGui = document.createElement('span');

    public init(params: IHeaderParams): void {
        this.eGui.textContent = params.displayName;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: IHeaderParams): boolean {
        refreshedWith.push(params.displayName);
        this.eGui.textContent = params.displayName;
        return true;
    }
}

class FirstInnerHeader implements IInnerHeaderComponent {
    private readonly eGui = document.createElement('span');

    public init(params: IHeaderParams): void {
        this.eGui.className = 'test-inner-first';
        this.eGui.textContent = `first ${params.displayName}`;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: IHeaderParams): boolean {
        this.eGui.textContent = `first ${params.displayName}`;
        return true;
    }
}

class SecondInnerHeader implements IInnerHeaderComponent {
    private readonly eGui = document.createElement('span');

    public init(params: IHeaderParams): void {
        this.eGui.className = 'test-inner-second';
        this.eGui.textContent = `second ${params.displayName}`;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: IHeaderParams): boolean {
        this.eGui.textContent = `second ${params.displayName}`;
        return true;
    }
}

let pendingInits: (() => void)[] = [];

class SlowInnerHeader implements IInnerHeaderComponent {
    private readonly eGui = document.createElement('span');

    public init(params: IHeaderParams): AgPromise<void> {
        this.eGui.className = 'test-inner-slow';
        this.eGui.textContent = params.displayName;
        return new AgPromise<void>((resolve) => {
            pendingInits.push(() => resolve());
        });
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: IHeaderParams): boolean {
        this.eGui.textContent = params.displayName;
        return true;
    }
}

describe('inner header component across column definition updates', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    beforeEach(() => {
        refreshedWith = [];
        pendingInits = [];
    });
    afterEach(() => gridMgr.reset());

    test('the default header with an inner header component shows the new header name', async () => {
        const colDef = (headerName: string): ColDef => ({
            field: 'a',
            headerName,
            headerComponentParams: { innerHeaderComponent: TestInnerHeader },
        });
        const api = await gridMgr.createGridAndWait('grid', { columnDefs: [colDef('Name')], rowData: [{ a: 1 }] });

        api.setGridOption('columnDefs', [colDef('Renamed')]);

        await waitFor(() => expect(TestGridsManager.getHTMLElement(api)!.textContent).toContain('Renamed'));
    });

    test('a column definition update adds, swaps and removes the inner header component', async () => {
        const colDef = (innerHeaderComponent?: new () => IInnerHeaderComponent): ColDef => ({
            field: 'a',
            headerName: 'Name',
            headerComponentParams: { innerHeaderComponent },
        });
        const api = await gridMgr.createGridAndWait('grid', { columnDefs: [colDef()], rowData: [{ a: 1 }] });
        const header = () => TestGridsManager.getHTMLElement(api)!.querySelector('.ag-header-cell[col-id="a"]')!;
        const state = () => ({
            first: header().querySelectorAll('.test-inner-first').length,
            second: header().querySelectorAll('.test-inner-second').length,
            text: header().querySelector('.ag-header-cell-text')?.textContent ?? header().textContent,
        });

        expect(state()).toEqual({ first: 0, second: 0, text: 'Name' });

        api.setGridOption('columnDefs', [colDef(FirstInnerHeader)]);
        await waitFor(() => expect(state()).toEqual({ first: 1, second: 0, text: 'first Name' }));

        api.setGridOption('columnDefs', [colDef(SecondInnerHeader)]);
        await waitFor(() => expect(state()).toEqual({ first: 0, second: 1, text: 'second Name' }));

        api.setGridOption('columnDefs', [colDef()]);
        await waitFor(() => expect(state()).toEqual({ first: 0, second: 0, text: 'Name' }));
    });

    test('a rename while the inner header component is still loading ends with the new name shown', async () => {
        const colDef = (headerName: string): ColDef => ({
            field: 'a',
            headerName,
            headerComponentParams: { innerHeaderComponent: SlowInnerHeader },
        });
        const resolveAll = () => {
            const pending = pendingInits;
            pendingInits = [];
            for (let i = 0, len = pending.length; i < len; ++i) {
                pending[i]();
            }
        };
        const innerHeaderTexts = (api: GridApi) =>
            Array.from(
                TestGridsManager.getHTMLElement(api)!.querySelectorAll('.ag-header-cell[col-id="a"] .test-inner-slow'),
                (el) => el.textContent
            );

        const loaded = gridMgr.createGrid('loaded', { columnDefs: [colDef('Name')], rowData: [{ a: 1 }] });
        await waitFor(() => {
            resolveAll();
            expect(innerHeaderTexts(loaded)).toEqual(['Name']);
        });
        gridMgr.reset();

        const api = gridMgr.createGrid('grid', { columnDefs: [colDef('Name')], rowData: [{ a: 1 }] });
        expect(pendingInits).toHaveLength(1);

        api.setGridOption('columnDefs', [colDef('Renamed')]);
        resolveAll();

        await waitFor(() => {
            resolveAll();
            expect(innerHeaderTexts(api)).toEqual(['Renamed']);
        });
        await asyncSetTimeout(0);
        resolveAll();
        expect(innerHeaderTexts(api)).toEqual(['Renamed']);
    });
});
