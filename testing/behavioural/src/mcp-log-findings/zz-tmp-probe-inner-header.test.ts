import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, _HeaderComp } from 'ag-grid-community';
const origRefresh = (_HeaderComp.prototype as any).refresh;
(_HeaderComp.prototype as any).refresh = function (p: any) { const old = this.params; const r = origRefresh.call(this, p); console.log('PROBE-REFRESH', p.displayName, r, this.workOutTemplate(p, true) == this.currentTemplate, this.workOutShowMenu() == this.currentShowMenu, p.enableSorting == this.currentSort, p.column.formulaRef == this.currentRef, this.currentSuppressMenuHide, old.enableFilterButton == p.enableFilterButton, old.enableFilterIcon == p.enableFilterIcon); return r; };

const calls: string[] = [];
class JsInner {
    eGui = document.createElement('span');
    init(p: any) {
        calls.push('init ' + p.displayName);
        this.eGui.textContent = p.displayName;
    }
    getGui() {
        return this.eGui;
    }
    refresh(p: any) {
        calls.push('refresh ' + p.displayName);
        this.eGui.textContent = p.displayName;
        return true;
    }
}

describe('probe', () => {
    const gm = new TestGridsManager({ modules: [ClientSideRowModelModule] });
    test('probe', async () => {
        const api = gm.createGrid('g', {
            columnDefs: [{ field: 'b', headerName: 'B', headerComponentParams: { innerHeaderComponent: JsInner } }],
            rowData: [{ b: 1 }],
        });
        await new Promise((r) => setTimeout(r, 0));
        api.setGridOption('columnDefs', [
            { field: 'b', headerName: 'B2', headerComponentParams: { innerHeaderComponent: JsInner } },
        ]);
        await new Promise((r) => setTimeout(r, 0));
        console.log('PROBE', JSON.stringify(calls));
        const tpl = `<div class="ag-cell-label-container" role="presentation"><div data-ref="eLabel" class="ag-header-cell-label" role="presentation"><span data-ref="eText" class="ag-header-cell-text"></span></div></div>`;
        const sameParams = { innerHeaderComponent: JsInner, template: tpl };
        calls.length = 0;
        api.setGridOption('columnDefs', [{ field: 'b', headerName: 'C', headerComponentParams: sameParams }]);
        await new Promise((r) => setTimeout(r, 0));
        api.setGridOption('columnDefs', [{ field: 'b', headerName: 'C2', headerComponentParams: sameParams }]);
        await new Promise((r) => setTimeout(r, 0));
        const cellBefore = document.querySelector('.ag-header-cell .ag-cell-label-container');
        api.setGridOption('columnDefs', [{ field: 'b', headerName: 'C3', headerComponentParams: sameParams }]);
        await new Promise((r) => setTimeout(r, 0));
        console.log('PROBE2', JSON.stringify(calls), cellBefore === document.querySelector('.ag-header-cell .ag-cell-label-container'), document.querySelector('.ag-header-cell')?.textContent);
    });
});
