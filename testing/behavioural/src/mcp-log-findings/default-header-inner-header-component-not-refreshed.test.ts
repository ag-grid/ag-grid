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
import { TestGridsManager } from 'ag-test-utils';

import type { ColDef, IHeaderParams, IInnerHeaderComponent } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

let created = 0;
let refreshedWith: string[] = [];

class TestInnerHeader implements IInnerHeaderComponent {
    private readonly eGui = document.createElement('span');

    public init(params: IHeaderParams): void {
        created++;
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

describe('innerHeaderComponent refresh on a column definition update', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    beforeEach(() => {
        created = 0;
        refreshedWith = [];
    });
    afterEach(() => gridMgr.reset());

    test('the default header refreshes its inner header component in place', async () => {
        const colDef = (headerName: string): ColDef => ({
            field: 'a',
            headerName,
            headerComponentParams: { innerHeaderComponent: TestInnerHeader },
        });
        const api = await gridMgr.createGridAndWait('grid', { columnDefs: [colDef('Name')], rowData: [{ a: 1 }] });
        expect(created).toBe(1);

        api.setGridOption('columnDefs', [colDef('Renamed')]);

        await waitFor(() => expect(TestGridsManager.getHTMLElement(api)!.textContent).toContain('Renamed'));
        expect(refreshedWith).toEqual(['Renamed']);
        expect(created).toBe(1);
    });
});
