import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { TestGridsManager, getVisibleTooltips } from 'ag-test-utils';

import { AllCommunityModule, getGridElement } from 'ag-grid-community';
import type { GetDetailRowDataParams, GridApi, ICellRendererComp } from 'ag-grid-community';
import { ContextMenuModule, MasterDetailModule } from 'ag-grid-enterprise';

vi.mock(import('ag-stack'), async (importOriginal) => ({
    ...(await importOriginal()),
    _isIOSUserAgent: () => true,
}));

describe('Tooltip touch ownership', () => {
    const grids = new TestGridsManager({ modules: [AllCommunityModule, ContextMenuModule, MasterDetailModule] });

    afterEach(() => {
        grids.reset();
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    function touchEvent(target: HTMLElement, type: 'touchstart' | 'touchend', identifier = 1): TouchEvent {
        const touch = new Touch({ identifier, target, clientX: 5, clientY: 5 });
        const event = new TouchEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            touches: type === 'touchstart' ? [touch] : [],
            changedTouches: [touch],
        });
        target.dispatchEvent(event);
        return event;
    }

    test('a shadow-based renderer retains the cell tooltip', async () => {
        class ShadowRenderer implements ICellRendererComp {
            private readonly gui = document.createElement('div');

            init(): void {
                this.gui.attachShadow({ mode: 'open' }).innerHTML = '<span>Shadow content</span>';
            }

            getGui(): HTMLElement {
                return this.gui;
            }

            refresh(): boolean {
                return false;
            }
        }
        const api = await grids.createGridAndWait('shadow-renderer-tooltip', {
            tooltipShowMode: 'standard',
            columnDefs: [{ field: 'value', tooltip: true, cellRenderer: ShadowRenderer }],
            rowData: [{ value: 'Cell tooltip' }],
            suppressContextMenu: true,
        });
        const renderer = getGridElement(api)!.querySelector('.ag-cell-value > div')!;
        const content = renderer.shadowRoot!.querySelector('span')!;
        vi.useFakeTimers();
        touchEvent(content, 'touchstart');
        await vi.advanceTimersByTimeAsync(600);
        expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual(['Cell tooltip']);
        touchEvent(content, 'touchend');
    });

    test.each([false, true])('the nested grid owns its long press (shadow root: %s)', async (shadow) => {
        let childGrid: HTMLElement;
        let childApi: GridApi;
        class NestedGrid implements ICellRendererComp {
            private readonly gui = document.createElement('div');

            init(): void {
                childGrid = document.createElement('div');
                const root = shadow ? this.gui.attachShadow({ mode: 'open' }) : this.gui;
                root.appendChild(childGrid);
                childApi = grids.createGrid(childGrid, {
                    columnDefs: [{ field: 'value', tooltip: true }],
                    rowData: [{ value: 'Child tooltip' }],
                    tooltipShowDelay: 0,
                    getContextMenuItems: () => [{ name: 'Child menu' }],
                });
            }

            getGui(): HTMLElement {
                return this.gui;
            }

            refresh(): boolean {
                return false;
            }
        }
        await grids.createGridAndWait('parent-grid', {
            columnDefs: [{ field: 'value', tooltip: true, cellRenderer: NestedGrid }],
            rowData: [{ value: 'Parent tooltip' }],
            getContextMenuItems: () => [{ name: 'Parent menu' }],
        });
        const child = await waitFor(() => {
            const element = childGrid.querySelector<HTMLElement>('.ag-cell');
            expect(element).not.toBeNull();
            return element!;
        });
        vi.useFakeTimers();
        const root = childGrid!.getRootNode() as Document | ShadowRoot;
        touchEvent(child, 'touchstart');
        await vi.advanceTimersByTimeAsync(600);
        expect(root.querySelectorAll('.ag-menu')).toHaveLength(1);
        expect(root.querySelector('.ag-menu')).toHaveTextContent('Child menu');
        expect(root.querySelector('.ag-menu')).not.toHaveTextContent('Parent menu');
        expect(root.querySelectorAll('.ag-tooltip')).toHaveLength(0);
        expect(touchEvent(child, 'touchend').defaultPrevented).toBe(true);

        childApi!.hidePopupMenu();
        childApi!.setGridOption('suppressContextMenu', true);
        touchEvent(child, 'touchstart', 2);
        await vi.advanceTimersByTimeAsync(600);
        const tooltips = root.querySelectorAll('.ag-tooltip:not(.ag-tooltip-hiding)');
        expect(tooltips).toHaveLength(1);
        expect(tooltips[0]).toHaveTextContent('Child tooltip');
        expect(document.querySelector('.ag-menu')).toBeNull();
        touchEvent(child, 'touchend', 2);
    });

    test('touch compatibility hover does not block unrelated mouse or keyboard activation', async () => {
        const api = await grids.createGridAndWait('touch-compatibility', {
            columnDefs: [{ field: 'value', tooltip: true }],
            rowData: [{ value: 'First' }, { value: 'Second' }],
            suppressContextMenu: true,
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        });
        const [first, second] = getGridElement(api)!.querySelectorAll<HTMLElement>('.ag-cell');
        vi.useFakeTimers();
        touchEvent(first, 'touchstart');
        await vi.advanceTimersByTimeAsync(600);
        expect(getVisibleTooltips()[0]).toHaveTextContent('First');
        touchEvent(first, 'touchend');
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        first.dispatchEvent(new MouseEvent('mouseenter'));
        await vi.advanceTimersByTimeAsync(0);
        expect(getVisibleTooltips()).toHaveLength(0);

        second.dispatchEvent(new MouseEvent('mouseenter'));
        await vi.advanceTimersByTimeAsync(0);
        expect(getVisibleTooltips()[0]).toHaveTextContent('Second');
        const button = document.createElement('button');
        const activate = vi.fn();
        button.addEventListener('click', activate);
        document.body.appendChild(button);
        try {
            button.click();
            button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
            expect(activate).toHaveBeenCalledTimes(2);
        } finally {
            button.remove();
        }
    });

    test.each([false, true])(
        'a tap suppresses compatibility hover only for its source (shadow root: %s)',
        async (shadow) => {
            const api = await grids.createGridAndWait('tap-compatibility', {
                tooltipShowMode: 'standard',
                columnDefs: [
                    {
                        field: 'value',
                        tooltip: true,
                        cellRenderer: () => {
                            const host = document.createElement('div');
                            const root = shadow ? host.attachShadow({ mode: 'open' }) : host;
                            root.innerHTML = '<span>Touch content</span>';
                            return host;
                        },
                    },
                ],
                rowData: [{ value: 'First' }, { value: 'Second' }],
                suppressContextMenu: true,
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
            });
            const [first, second] = getGridElement(api)!.querySelectorAll<HTMLElement>('.ag-cell');
            const renderer = first.querySelector('.ag-cell-value > div')!;
            const content = (renderer.shadowRoot ?? renderer).querySelector('span')!;
            vi.useFakeTimers();
            touchEvent(content, 'touchstart');
            touchEvent(content, 'touchend');
            first.dispatchEvent(new MouseEvent('mouseenter'));
            await vi.advanceTimersByTimeAsync(0);
            expect(getVisibleTooltips()).toHaveLength(0);

            second.dispatchEvent(new MouseEvent('mouseenter'));
            await vi.advanceTimersByTimeAsync(0);
            expect(getVisibleTooltips()[0]).toHaveTextContent('Second');
            document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

            await vi.advanceTimersByTimeAsync(800);
            first.dispatchEvent(new MouseEvent('mouseenter'));
            await vi.advanceTimersByTimeAsync(0);
            expect(getVisibleTooltips()[0]).toHaveTextContent('First');
        }
    );

    test('master/detail long press uses only the detail grid menu or tooltip', async () => {
        const getDetailMenuItems = vi.fn(() => [{ name: 'Detail menu' }]);
        const onDetailDataRendered = vi.fn();
        const api = await grids.createGridAndWait('master-detail-tooltips', {
            columnDefs: [{ field: 'name', cellRenderer: 'agGroupCellRenderer', tooltip: true }],
            rowData: [{ name: 'Alex' }],
            masterDetail: true,
            groupDefaultExpanded: 1,
            getContextMenuItems: () => [{ name: 'Master menu' }],
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'sport', tooltip: true }],
                    suppressRowVirtualisation: true,
                    onFirstDataRendered: onDetailDataRendered,
                    getContextMenuItems: getDetailMenuItems,
                },
                getDetailRowData: (params: GetDetailRowDataParams) => params.successCallback([{ sport: 'Swimming' }]),
            },
        });
        await waitFor(() => expect(onDetailDataRendered).toHaveBeenCalledTimes(1));
        const cell = await waitFor(() => {
            const element = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell[col-id="sport"]');
            expect(element).not.toBeNull();
            return element!;
        });
        vi.useFakeTimers();
        touchEvent(cell, 'touchstart');
        await vi.advanceTimersByTimeAsync(600);
        expect(getDetailMenuItems).toHaveBeenCalledTimes(1);
        expect(document.querySelectorAll('.ag-menu')).toHaveLength(1);
        expect(document.querySelector('.ag-menu')).toHaveTextContent('Detail menu');
        expect(getVisibleTooltips()).toHaveLength(0);
        touchEvent(cell, 'touchend');
        const detailApi = api.getDetailGridInfo('detail_0')!.api!;
        detailApi.hidePopupMenu();
        detailApi.setGridOption('suppressContextMenu', true);
        touchEvent(cell, 'touchstart', 2);
        await vi.advanceTimersByTimeAsync(600);
        expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual(['Swimming']);
        touchEvent(cell, 'touchend', 2);
    });

    test('suppressTouch prevents tooltip activation', async () => {
        const api = await grids.createGridAndWait('suppressed-touch', {
            columnDefs: [{ field: 'value', tooltip: true }],
            rowData: [{ value: 'First' }],
            suppressTouch: true,
            suppressContextMenu: true,
        });
        const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!;
        vi.useFakeTimers();
        touchEvent(cell, 'touchstart');
        await vi.advanceTimersByTimeAsync(600);
        expect(getVisibleTooltips()).toHaveLength(0);
        touchEvent(cell, 'touchend');
    });

    test.each([false, true])('menu item long press supports an external popup parent: %s', async (external) => {
        const api = await grids.createGridAndWait('popup-menu-tooltip', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: 'First' }],
            popupParent: external ? document.body : undefined,
            tooltipTrigger: 'hover',
            getContextMenuItems: () => [{ name: 'Action', tooltip: 'Menu tooltip' }],
        });
        api.showContextMenu();
        const item = await waitFor(() => {
            const element = document.querySelector<HTMLElement>('.ag-menu-option');
            expect(element).not.toBeNull();
            return element!;
        });
        expect(getVisibleTooltips()).toHaveLength(0);
        vi.useFakeTimers();
        touchEvent(item, 'touchstart');
        await vi.advanceTimersByTimeAsync(600);
        expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual(['Menu tooltip']);
        touchEvent(item, 'touchend');
    });
});
