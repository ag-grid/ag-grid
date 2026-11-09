import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

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

describe('Renderer form fields', () => {
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

    test.each([false, true])(
        'clicking editable content keeps browser focus on its editor (fullWidth=%s)',
        async (fullWidth) => {
            const renderer = () => {
                const editor = document.createElement('div');
                editor.contentEditable = 'true';
                const text = document.createElement('span');
                text.textContent = 'Editable name';
                editor.appendChild(text);
                for (const eventName of DOWN_EVENT_NAMES) {
                    editor.addEventListener(eventName, (event) => event.preventDefault());
                }
                return editor;
            };
            const api = await gridsManager.createGridAndWait('editable', {
                columnDefs: [{ field: 'name', cellRenderer: renderer }],
                rowData: [{ name: 'Alice' }],
                enableCellTextSelection: true,
                isFullWidthRow: () => fullWidth,
                fullWidthCellRenderer: renderer,
            });
            const gridDiv = TestGridsManager.getHTMLElement(api)!;
            const editor = gridDiv.querySelector<HTMLElement>('[contenteditable]')!;
            const text = editor.querySelector('span')!;
            editor.focus();
            expect(document.activeElement).toBe(editor);

            for (const eventName of DOWN_EVENT_NAMES) {
                text.dispatchEvent(new MouseEvent(eventName, { bubbles: true, cancelable: true }));
            }
            await asyncSetTimeout(0);

            expect(document.activeElement).toBe(editor);
        }
    );
});
