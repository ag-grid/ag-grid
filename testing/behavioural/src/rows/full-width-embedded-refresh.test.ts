import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

const events: string[] = [];
let refuseRefresh: string | null = null;

class SectionRenderer implements ICellRendererComp {
    private readonly eGui = document.createElement('div');
    private section = '';

    public init(params: ICellRendererParams): void {
        this.section = params.pinned ?? 'center';
        events.push(`init ${this.section} ${params.data.v}`);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: ICellRendererParams): boolean {
        events.push(`refresh ${this.section} ${params.pinned ?? 'center'} ${params.data.v}`);
        return this.section !== refuseRefresh;
    }
}

describe('embedded full width row refresh', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    afterEach(() => {
        gridsManager.reset();
        events.length = 0;
        refuseRefresh = null;
    });

    test('an update refreshes every section with its own params, and any section that refuses redraws the row once all have refreshed', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'l', pinned: 'left' }, { field: 'v' }, { field: 'r', pinned: 'right' }],
            rowData: [{ id: '1', v: 'a' }],
            getRowId: (params) => params.data.id,
            isFullWidthRow: () => true,
            embedFullWidthRows: true,
            fullWidthCellRenderer: SectionRenderer,
        });
        await asyncSetTimeout(0);
        expect(events.sort()).toEqual(['init center a', 'init left a', 'init right a']);

        events.length = 0;
        api.getRowNode('1')!.setData({ id: '1', v: 'b' });
        await asyncSetTimeout(0);
        expect(events).toEqual(['refresh left left b', 'refresh center center b', 'refresh right right b']);

        for (const [refuser, v] of [
            ['left', 'c'],
            ['center', 'd'],
            ['right', 'e'],
        ]) {
            events.length = 0;
            refuseRefresh = refuser;
            api.getRowNode('1')!.setData({ id: '1', v });
            await asyncSetTimeout(0);
            expect(events.slice(0, 3)).toEqual([
                `refresh left left ${v}`,
                `refresh center center ${v}`,
                `refresh right right ${v}`,
            ]);
            expect(events.slice(3).sort()).toEqual([`init center ${v}`, `init left ${v}`, `init right ${v}`]);
        }
    });
});
