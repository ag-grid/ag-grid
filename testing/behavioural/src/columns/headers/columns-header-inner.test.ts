import type { ColDef, IHeaderParams } from 'ag-grid-community';
import { ClientSideRowModelModule, createGrid } from 'ag-grid-community';

const rowData = [{ a: 1, b: 10 }];

class TrackingHeaderComp {
    static initCount = 0;
    static destroyCount = 0;
    static refreshCount = 0;

    static reset(): void {
        TrackingHeaderComp.initCount = 0;
        TrackingHeaderComp.destroyCount = 0;
        TrackingHeaderComp.refreshCount = 0;
    }

    private readonly gui = document.createElement('div');

    init(_params: IHeaderParams): void {
        TrackingHeaderComp.initCount++;
    }

    refresh(_params: IHeaderParams): boolean {
        TrackingHeaderComp.refreshCount++;
        return true;
    }

    getGui(): HTMLElement {
        return this.gui;
    }

    destroy(): void {
        TrackingHeaderComp.destroyCount++;
    }
}

class TrackingInnerHeader {
    static initCount = 0;
    static destroyCount = 0;
    static refreshCount = 0;

    static reset(): void {
        TrackingInnerHeader.initCount = 0;
        TrackingInnerHeader.destroyCount = 0;
        TrackingInnerHeader.refreshCount = 0;
    }

    private readonly gui = document.createElement('span');

    init(_params: IHeaderParams): void {
        TrackingInnerHeader.initCount++;
    }

    refresh(_params: IHeaderParams): boolean {
        TrackingInnerHeader.refreshCount++;
        return true;
    }

    getGui(): HTMLElement {
        return this.gui;
    }

    destroy(): void {
        TrackingInnerHeader.destroyCount++;
    }
}

class RejectingInnerHeader {
    static initCount = 0;
    static destroyCount = 0;
    static refreshCount = 0;

    static reset(): void {
        RejectingInnerHeader.initCount = 0;
        RejectingInnerHeader.destroyCount = 0;
        RejectingInnerHeader.refreshCount = 0;
    }

    private gui = document.createElement('span');

    init(_params: IHeaderParams): void {
        RejectingInnerHeader.initCount++;
        this.gui = document.createElement('span');
    }

    refresh(_params: IHeaderParams): boolean {
        RejectingInnerHeader.refreshCount++;
        return false;
    }

    getGui(): HTMLElement {
        return this.gui;
    }

    destroy(): void {
        RejectingInnerHeader.destroyCount++;
    }
}

const columnDefs: ColDef[] = [
    { field: 'a', headerComponent: TrackingHeaderComp },
    { field: 'b', sortable: false, headerComponentParams: { innerHeaderComponent: TrackingInnerHeader } },
];

const rejectingColumnDefs: ColDef[] = [
    { field: 'a', headerComponent: TrackingHeaderComp },
    { field: 'b', sortable: false, headerComponentParams: { innerHeaderComponent: RejectingInnerHeader } },
];

describe('header component lifecycle', () => {
    beforeEach(() => {
        TrackingHeaderComp.reset();
        TrackingInnerHeader.reset();
        RejectingInnerHeader.reset();
    });

    test('headerComponent and innerHeaderComponent are both refreshed rather than remounted when column defs are updated', () => {
        const eGridDiv = document.createElement('div');
        const api = createGrid(eGridDiv, { columnDefs, rowData }, { modules: [ClientSideRowModelModule] });

        expect(TrackingHeaderComp.initCount).toBe(1);
        expect(TrackingHeaderComp.destroyCount).toBe(0);
        expect(TrackingInnerHeader.initCount).toBe(1);
        expect(TrackingInnerHeader.destroyCount).toBe(0);

        // Simulates a React setColumnDefs call with equivalent definitions.
        // Before the fix, HeaderComp.refresh() always returned false due to a broken
        // template object reference comparison, causing innerHeaderComponent to be remounted.
        api.setGridOption('columnDefs', [...columnDefs]);

        expect(TrackingHeaderComp.initCount).toBe(1);
        expect(TrackingHeaderComp.destroyCount).toBe(0);
        expect(TrackingHeaderComp.refreshCount).toBe(1);
        expect(TrackingInnerHeader.initCount).toBe(1);
        expect(TrackingInnerHeader.destroyCount).toBe(0);
        expect(TrackingInnerHeader.refreshCount).toBe(1);

        api.destroy();
    });

    test('innerHeaderComponent is remounted when its refresh returns false, outer headerComp stays alive', () => {
        const eGridDiv = document.createElement('div');
        const api = createGrid(
            eGridDiv,
            { columnDefs: rejectingColumnDefs, rowData },
            { modules: [ClientSideRowModelModule] }
        );

        expect(TrackingHeaderComp.initCount).toBe(1);
        expect(RejectingInnerHeader.initCount).toBe(1);
        expect(RejectingInnerHeader.destroyCount).toBe(0);

        api.setGridOption('columnDefs', [...rejectingColumnDefs]);

        // Inner component signalled it cannot handle the update — it should be replaced
        expect(RejectingInnerHeader.refreshCount).toBe(1);
        expect(RejectingInnerHeader.destroyCount).toBe(1);
        expect(RejectingInnerHeader.initCount).toBe(2);

        // Outer headerComp on the adjacent column must not have been remounted
        expect(TrackingHeaderComp.initCount).toBe(1);
        expect(TrackingHeaderComp.destroyCount).toBe(0);

        api.destroy();
    });
});
