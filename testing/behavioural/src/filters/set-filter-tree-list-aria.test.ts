import type { GridApi, ISetFilterParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import type { SetFilter } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

interface Row {
    category: string;
}

const ROW_DATA: Row[] = [
    { category: 'fruits/apple' },
    { category: 'fruits/banana' },
    { category: 'veggies/carrot' },
    { category: 'veggies/lettuce' },
];

// jsdom has no layout engine, so VirtualList viewports get 20px height from the mock layout
// and render 0 rows. Patch getBoundingClientRect + offsetHeight at the prototype level so
// the set filter's virtual list viewport has a usable height and actually renders rows.
let savedGetBoundingClientRect: typeof Element.prototype.getBoundingClientRect;
const origOffsetHeightDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
const origClientHeightDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');

describe('Set Filter Tree List - Accessibility (aria-hidden + focus)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, SetFilterModule],
    });

    let host: HTMLElement | null = null;

    beforeAll(() => {
        savedGetBoundingClientRect = Element.prototype.getBoundingClientRect;

        Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
            configurable: true,
            writable: true,
            value: function (this: Element) {
                const rect = savedGetBoundingClientRect.call(this);
                if (this.classList.contains('ag-filter-virtual-list-viewport')) {
                    return new DOMRect(rect.x, rect.y, rect.width || 200, 400);
                }
                return rect;
            },
        });

        // mockGridLayout defines offsetHeight on Element.prototype, but jsdom defines it on
        // HTMLElement.prototype (returning 0), which takes precedence. Override here so
        // VirtualList's gui.offsetHeight reads the patched getBoundingClientRect().
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
            get(this: HTMLElement) {
                return this.getBoundingClientRect().height;
            },
            configurable: true,
        });
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
            get(this: HTMLElement) {
                return this.getBoundingClientRect().height;
            },
            configurable: true,
        });
    });

    afterAll(() => {
        if (savedGetBoundingClientRect) {
            Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
                configurable: true,
                writable: true,
                value: savedGetBoundingClientRect,
            });
        }
        if (origOffsetHeightDesc) {
            Object.defineProperty(HTMLElement.prototype, 'offsetHeight', origOffsetHeightDesc);
        }
        if (origClientHeightDesc) {
            Object.defineProperty(HTMLElement.prototype, 'clientHeight', origClientHeightDesc);
        }
    });

    afterEach(() => {
        host?.remove();
        host = null;
        gridsManager.reset();
    });

    async function openTreeListFilter(): Promise<{ api: GridApi<Row>; setFilter: SetFilter<string> }> {
        const api = await gridsManager.createGridAndWait<Row>('grid1', {
            columnDefs: [
                {
                    field: 'category',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        treeList: true,
                        treeListPathGetter: (value) => (value ? value.split('/') : null),
                    } as ISetFilterParams,
                },
            ],
            rowData: ROW_DATA,
        });

        const setFilter = (await api.getColumnFilterInstance('category')) as SetFilter<string> | null | undefined;
        if (!setFilter) {
            throw new Error('Expected SetFilter instance for category column');
        }

        host = document.createElement('div');
        host.style.width = '300px';
        host.style.height = '400px';
        host.appendChild(setFilter.getGui());
        document.body.appendChild(host);

        setFilter.afterGuiAttached();
        await asyncSetTimeout(0);

        // Nudge the viewport so drawVirtualRows() re-evaluates the now-positive height.
        const viewport = host.querySelector<HTMLElement>('.ag-filter-virtual-list-viewport');
        if (viewport) {
            viewport.scrollTop = 1;
            viewport.scrollTop = 0;
        }
        await asyncSetTimeout(0);

        return { api, setFilter };
    }

    test('tree-list group checkbox suppresses focus on mousedown without breaking click toggle', async () => {
        await openTreeListFilter();

        const ariaHiddenItem = document.querySelector<HTMLElement>('.ag-set-filter-item[aria-hidden="true"]');
        expect(ariaHiddenItem).not.toBeNull();

        const input = ariaHiddenItem!.querySelector<HTMLInputElement>('input.ag-input-field-input');
        expect(input).not.toBeNull();
        const initiallyChecked = input!.checked;

        const mousedownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        input!.dispatchEvent(mousedownEvent);
        expect(mousedownEvent.defaultPrevented).toBe(true);

        input!.click();
        await asyncSetTimeout(0);
        expect(input!.checked).toBe(!initiallyChecked);
    });
});
