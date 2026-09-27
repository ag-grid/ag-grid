import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
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

describe('Full width row form fields', () => {
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
        // jsdom has no layout, so give the input the offsetParent the visibility check reads
        Object.defineProperty(input, 'offsetParent', { configurable: true, get: () => document.body });

        input.focus();
        for (const eventName of DOWN_EVENT_NAMES) {
            input.dispatchEvent(new MouseEvent(eventName, { bubbles: true, cancelable: true }));
        }
        input.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        await asyncSetTimeout(0);

        expect(document.activeElement).toBe(input);
    });

    test('a forced refresh refreshes a full-width group row whose renderer can refresh, not redraws it', async () => {
        const refreshed: string[] = [];
        const api = await gridsManager.createGridAndWait(
            'grid1',
            {
                columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'name' }],
                rowData: [{ group: 'G', name: 'Alice' }],
                groupDisplayType: 'groupRows',
                groupRowRenderer: class implements ICellRendererComp {
                    private readonly eGui = document.createElement('div');
                    public init(params: ICellRendererParams): void {
                        this.eGui.textContent = params.value;
                    }
                    public getGui(): HTMLElement {
                        return this.eGui;
                    }
                    public refresh(params: ICellRendererParams): boolean {
                        refreshed.push(params.value);
                        return true;
                    }
                },
            },
            { modules: [RenderApiModule, RowGroupingModule] }
        );
        const groupRow = () => TestGridsManager.getHTMLElement(api)!.querySelector('.ag-row[row-index="0"]');
        const before = groupRow();

        api.refreshCells({ rowNodes: [api.getDisplayedRowAtIndex(0)!], force: true });

        expect({ sameRow: groupRow() === before, refreshed }).toEqual({ sameRow: true, refreshed: ['G'] });
    });
});
