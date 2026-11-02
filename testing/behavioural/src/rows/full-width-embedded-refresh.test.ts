import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { ClientSideRowModelModule, RenderApiModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

const events: string[] = [];
let refuseRefresh: string | null = null;

class SectionRenderer implements ICellRendererComp {
    private readonly eGui = document.createElement('div');
    public section = '';

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

class NoRefreshRenderer {
    private readonly eGui = document.createElement('div');

    public init(params: ICellRendererParams): void {
        this.eGui.textContent = params.data.v;
        events.push(`init ${params.data.v}`);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}

class GroupRowRenderer implements ICellRendererComp {
    private readonly eGui = document.createElement('div');

    public init(params: ICellRendererParams): void {
        events.push(`init ${params.node.key}`);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: ICellRendererParams): boolean {
        events.push(`refresh ${params.node.key}`);
        return refuseRefresh !== 'group';
    }
}

describe('embedded full width row refresh', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RenderApiModule, RowGroupingModule],
    });

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

    test.each([true, false])(
        'with embedFullWidthRows %s, an update re-creates a full width renderer that has no refresh method',
        async (embedFullWidthRows) => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'l', pinned: 'left' }, { field: 'v' }, { field: 'r', pinned: 'right' }],
                rowData: [{ id: '1', v: 'a' }],
                getRowId: (params) => params.data.id,
                isFullWidthRow: () => true,
                embedFullWidthRows,
                fullWidthCellRenderer: NoRefreshRenderer,
            });
            await asyncSetTimeout(0);
            const initsOf = (v: string) =>
                embedFullWidthRows ? [`init ${v}`, `init ${v}`, `init ${v}`] : [`init ${v}`];
            expect(events).toEqual(initsOf('a'));

            events.length = 0;
            api.getRowNode('1')!.setData({ id: '1', v: 'b' });
            await asyncSetTimeout(0);
            expect(events).toEqual(initsOf('b'));
        }
    );

    test('refreshCells on a group row refreshes a group row renderer that accepts it, and re-creates one that refuses', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'v' }],
            rowData: [{ id: '1', g: 'x', v: 'a' }],
            getRowId: (params) => params.data.id,
            groupDisplayType: 'groupRows',
            groupRowRenderer: GroupRowRenderer,
        });
        await asyncSetTimeout(0);
        const groupRow = api.getDisplayedRowAtIndex(0)!;
        expect(events).toEqual(['init x']);

        events.length = 0;
        api.refreshCells({ rowNodes: [groupRow] });
        await asyncSetTimeout(0);
        expect(events).toEqual(['refresh x']);

        events.length = 0;
        refuseRefresh = 'group';
        api.refreshCells({ rowNodes: [groupRow] });
        await asyncSetTimeout(0);
        expect(events).toEqual(['refresh x', 'init x']);
    });

    test('getCellRendererInstances returns every section renderer of an embedded row, and the one of a full width row', async () => {
        const options = (embedFullWidthRows: boolean) => ({
            columnDefs: [
                { field: 'l', pinned: 'left' as const },
                { field: 'v' },
                { field: 'r', pinned: 'right' as const },
            ],
            rowData: [{ id: '1', v: 'a' }],
            isFullWidthRow: () => true,
            embedFullWidthRows,
            fullWidthCellRenderer: SectionRenderer,
        });
        const embedded = gridsManager.createGrid('embedded', options(true));
        const plain = gridsManager.createGrid('plain', options(false));
        await asyncSetTimeout(0);

        const sections = (renderers: unknown[]) => renderers.map((r) => (r as SectionRenderer).section).sort();
        expect(sections(embedded.getCellRendererInstances())).toEqual(['center', 'left', 'right']);
        expect(sections(plain.getCellRendererInstances())).toEqual(['center']);
    });
});
