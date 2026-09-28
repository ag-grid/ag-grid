import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ICellRendererComp, ICellRendererParams, RefreshCellsParams } from 'ag-grid-community';
import { ClientSideRowModelModule, RenderApiModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

// the grid registers row mousedown handling on the first supported event of
// pointerdown/touchstart/mousedown; dispatch all three so whichever the test
// environment supports reaches the handler
const DOWN_EVENT_NAMES = ['pointerdown', 'touchstart', 'mousedown'] as const;

class FullWidthInputRenderer implements ICellRendererComp {
    private eGui!: HTMLElement;

    public init(_params: ICellRendererParams): void {
        this.eGui = document.createElement('div');
        const eInput = document.createElement('input');
        eInput.type = 'text';
        // custom renderers commonly prevent default mouse handling; the grid must
        // still leave browser focus on the form field the user clicked
        for (const eventName of DOWN_EVENT_NAMES) {
            eInput.addEventListener(eventName, (event) => event.preventDefault());
        }
        this.eGui.appendChild(eInput);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(): boolean {
        return false;
    }
}

describe('Full width rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    test('clicking an input inside a full width row keeps browser focus on the input', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            isFullWidthRow: () => true,
            fullWidthCellRenderer: FullWidthInputRenderer,
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const input = gridDiv.querySelector<HTMLInputElement>('.ag-full-width-row input')!;
        expect(input).not.toBeNull();
        // happy-dom has no layout, so give the input the offsetParent the visibility check reads
        Object.defineProperty(input, 'offsetParent', { configurable: true, get: () => document.body });

        input.focus();
        for (const eventName of DOWN_EVENT_NAMES) {
            input.dispatchEvent(new MouseEvent(eventName, { bubbles: true, cancelable: true }));
        }
        input.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await asyncSetTimeout(0);

        expect(document.activeElement).toBe(input);
    });

    test('refreshCells refreshes a full-width group row only when listed, forced or not, and redraws it when its renderer cannot refresh', async () => {
        const refreshCells = async (canRefresh: boolean, params: RefreshCellsParams) => {
            const calls: string[] = [];
            const api = await gridsManager.createGridAndWait(
                'grid1',
                {
                    columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'name' }],
                    rowData: [{ group: 'G', name: 'Alice' }],
                    groupDisplayType: 'groupRows',
                    groupRowRenderer: class implements ICellRendererComp {
                        private readonly eGui = document.createElement('div');
                        public init(params: ICellRendererParams): void {
                            calls.push(`init ${params.value}`);
                            this.eGui.textContent = params.value;
                        }
                        public getGui(): HTMLElement {
                            return this.eGui;
                        }
                        public refresh(params: ICellRendererParams): boolean {
                            calls.push(`refresh ${params.value}`);
                            return canRefresh;
                        }
                    },
                },
                { modules: [RenderApiModule, RowGroupingModule] }
            );
            const groupRow = () => TestGridsManager.getHTMLElement(api)!.querySelector('.ag-row[row-index="0"]');
            const before = groupRow();

            api.refreshCells(params.rowNodes ? { ...params, rowNodes: [api.getDisplayedRowAtIndex(0)!] } : params);

            const result = { sameRow: groupRow() === before, calls };
            gridsManager.reset();
            return result;
        };

        const listed = { rowNodes: [], force: true };
        expect({
            refreshes: await refreshCells(true, listed),
            redraws: await refreshCells(false, listed),
            notForced: await refreshCells(false, { ...listed, force: false }),
            notListed: await refreshCells(false, { force: true }),
        }).toEqual({
            refreshes: { sameRow: true, calls: ['init G', 'refresh G'] },
            redraws: { sameRow: false, calls: ['init G', 'refresh G', 'init G'] },
            notForced: { sameRow: false, calls: ['init G', 'refresh G', 'init G'] },
            notListed: { sameRow: true, calls: ['init G'] },
        });
    });

    test('a row refreshes in place while its row type holds, and redraws whenever isFullWidthRow changes its answer, for a leaf row both ways and a group row', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ id: '1', name: 'Alice', fullWidth: false }],
            getRowId: (params) => params.data.id,
            isFullWidthRow: (params) => params.rowNode.data?.fullWidth,
            fullWidthCellRenderer: FullWidthInputRenderer,
        });
        const row = () => TestGridsManager.getHTMLElement(api)!.querySelector('.ag-row[row-index="0"]')!;
        const before = row();

        api.getRowNode('1')!.setData({ id: '1', name: 'Bob', fullWidth: false });
        const sameType = { sameRow: row() === before, text: row().textContent };
        api.getRowNode('1')!.setData({ id: '1', name: 'Bob', fullWidth: true });
        const fullWidthRow = row();
        const toFullWidth = {
            sameRow: fullWidthRow === before,
            fullWidth: fullWidthRow.classList.contains('ag-full-width-row'),
            rendered: !!fullWidthRow.querySelector('input'),
        };
        api.getRowNode('1')!.setData({ id: '1', name: 'Bob', fullWidth: false });
        const backToNormal = {
            sameRow: row() === fullWidthRow,
            fullWidth: row().classList.contains('ag-full-width-row'),
            text: row().textContent,
        };
        gridsManager.reset();

        // a group row renderer that can refresh would keep drawing the group, were only full width compared
        let groupFullWidth = false;
        const groupApi = await gridsManager.createGridAndWait(
            'grid2',
            {
                columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'name' }],
                rowData: [{ group: 'G', name: 'Alice' }],
                groupDisplayType: 'groupRows',
                isFullWidthRow: (params) => groupFullWidth && !!params.rowNode.group,
                fullWidthCellRenderer: FullWidthInputRenderer,
                groupRowRenderer: class implements ICellRendererComp {
                    private readonly eGui = document.createElement('div');
                    public getGui(): HTMLElement {
                        return this.eGui;
                    }
                    public refresh(): boolean {
                        return true;
                    }
                },
            },
            { modules: [RenderApiModule, RowGroupingModule] }
        );
        groupFullWidth = true;
        groupApi.refreshCells({ rowNodes: [groupApi.getDisplayedRowAtIndex(0)!], force: true });
        const groupRow = TestGridsManager.getHTMLElement(groupApi)!.querySelector('.ag-row[row-index="0"]')!;

        expect({ sameType, toFullWidth, backToNormal, groupToFullWidth: !!groupRow.querySelector('input') }).toEqual({
            sameType: { sameRow: true, text: 'Bob' },
            toFullWidth: { sameRow: false, fullWidth: true, rendered: true },
            backToNormal: { sameRow: false, fullWidth: false, text: 'Bob' },
            groupToFullWidth: true,
        });
    });
});
