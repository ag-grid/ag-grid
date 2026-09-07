import { getByTestId, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, asyncSetTimeout, getVisibleTooltips as getTooltips, waitForTooltips } from 'ag-test-utils';

import { RenderApiModule, TooltipModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type {
    GridOptions,
    ICellRendererComp,
    ICellRendererParams,
    IHeaderComp,
    IHeaderParams,
    ITooltipComp,
    ITooltipParams,
    Module,
    TooltipCallbackParams,
} from 'ag-grid-community';

import { allowLegacyTooltipProperties, resetLegacyTooltipProperties } from './legacyTooltipTestUtils';

function dispatchTouchEvent(
    target: EventTarget,
    type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
    touch: Touch
): void {
    const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent;
    const isActive = type === 'touchstart' || type === 'touchmove';
    Object.defineProperties(event, {
        touches: { value: isActive ? [touch] : [] },
        targetTouches: { value: isActive ? [touch] : [] },
        changedTouches: { value: [touch] },
    });
    target.dispatchEvent(event);
}

function touchStart(element: HTMLElement, identifier = 1): Touch {
    const touch = { identifier, target: element, clientX: 5, clientY: 5 } as unknown as Touch;
    dispatchTouchEvent(element, 'touchstart', touch);
    return touch;
}

function touchEnd(touch: Touch): void {
    dispatchTouchEvent(document, 'touchend', touch);
}

describe('Unified tooltip API', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TooltipModule, RenderApiModule] as Module[],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => {
        gridMgr.reset();
        resetLegacyTooltipProperties();
    });

    test('supports displayed values, static content, callbacks, and popup metadata', async () => {
        const callbackParams: TooltipCallbackParams[] = [];
        const popupParams: Array<{ columnId?: string; rowId?: string; location?: string }> = [];
        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    colId: 'formatted',
                    valueGetter: ({ data }) => data.raw * 2,
                    valueFormatter: ({ value }) => `$${value}.00`,
                    tooltip: true,
                },
                { field: 'raw', tooltip: 'Static tooltip' },
                {
                    colId: 'callback',
                    valueGetter: ({ data }) => data.raw * 2,
                    valueFormatter: ({ value }) => `$${value}.00`,
                    tooltip: (params) => {
                        callbackParams.push(params);
                        return `${params.valueFormatted} from callback`;
                    },
                },
            ],
            rowData: [{ raw: 7 }],
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
            postProcessPopup: ({ type, column, rowNode, tooltipLocation }) => {
                if (type === 'tooltip') {
                    popupParams.push({ columnId: column?.getColId(), rowId: rowNode?.id, location: tooltipLocation });
                }
            },
        };

        const api = await gridMgr.createGridAndWait('tooltip-unified-values', gridOptions);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const formattedCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'formatted')));
        const staticCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'raw')));
        const callbackCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'callback')));

        await userEvent.hover(formattedCell);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('$14.00');
        expect(popupParams.at(-1)).toEqual({ columnId: 'formatted', rowId: '0', location: 'cell' });

        await userEvent.unhover(formattedCell);
        await waitForTooltips(0);
        await userEvent.hover(staticCell);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Static tooltip');

        await userEvent.unhover(staticCell);
        await waitForTooltips(0);
        await userEvent.hover(callbackCell);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('$14.00 from callback');
        expect(callbackParams.at(-1)).toMatchObject({ value: 14, valueFormatted: '$14.00', location: 'cell' });
    });

    test('tooltip false disables Column Definition content without changing renderer tooltip components', async () => {
        // Soft-deprecated sources remain supported, but an explicit false must take precedence over them.
        allowLegacyTooltipProperties();
        let customTooltipInitialisations = 0;

        class CustomTooltip implements ITooltipComp {
            private eGui!: HTMLElement;

            public init(params: ITooltipParams): void {
                customTooltipInitialisations++;
                this.eGui = document.createElement('div');
                this.eGui.textContent = `Custom: ${params.value}`;
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        class RendererTooltip implements ICellRendererComp {
            private eGui!: HTMLElement;

            public init(params: ICellRendererParams): void {
                this.eGui = document.createElement('span');
                this.eGui.textContent = String(params.value);
                params.setTooltip('Renderer tooltip', () => true);
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }

            public refresh(): boolean {
                return false;
            }
        }

        const api = await gridMgr.createGridAndWait('tooltip-false-precedence', {
            defaultColDef: { tooltip: true, tooltipComponent: CustomTooltip },
            columnDefs: [
                { field: 'runtime', tooltip: false, cellRenderer: RendererTooltip },
                {
                    field: 'disabled',
                    tooltip: false,
                    tooltipField: 'runtime',
                    tooltipValueGetter: () => 'Legacy getter tooltip',
                },
                { field: 'configured' },
            ],
            rowData: [{ runtime: 'A', disabled: 'B', configured: 'C' }],
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const runtimeCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'runtime')));
        const disabledCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'disabled')));
        const configuredCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'configured')));

        await userEvent.hover(runtimeCell);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Custom: Renderer tooltip');
        expect(customTooltipInitialisations).toBe(1);

        await userEvent.unhover(runtimeCell);
        await waitForTooltips(0);
        await userEvent.hover(disabledCell);
        await asyncSetTimeout(0);
        expect(getTooltips()).toHaveLength(0);

        await userEvent.unhover(disabledCell);
        await userEvent.hover(configuredCell);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Custom: C');
        expect(customTooltipInitialisations).toBe(2);
    });

    test('headerTooltip uses the same true, string, callback, and false forms', async () => {
        // The legacy getter remains a supported fallback and is still overridden by an explicit false.
        allowLegacyTooltipProperties();
        const seenCallbackParams: TooltipCallbackParams[] = [];

        class CustomHeaderTooltip implements ITooltipComp {
            private readonly eGui = document.createElement('div');

            public init(params: ITooltipParams): void {
                this.eGui.textContent = `Custom: ${params.value}`;
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        const api = await gridMgr.createGridAndWait('tooltip-unified-headers', {
            columnDefs: [
                {
                    field: 'athlete',
                    headerName: 'Athlete Name',
                    headerTooltip: true,
                    headerTooltipValueGetter: () => 'Ignored legacy getter',
                },
                {
                    field: 'age',
                    headerTooltip: 'Static header tooltip',
                    headerTooltipValueGetter: () => 'Legacy getter tooltip',
                },
                {
                    field: 'year',
                    headerTooltip: (params) => {
                        seenCallbackParams.push(params);
                        return `Header: ${params.value}`;
                    },
                    headerTooltipValueGetter: () => 'Ignored legacy getter',
                },
                {
                    field: 'sport',
                    headerTooltip: false,
                    headerTooltipValueGetter: () => 'Legacy header tooltip',
                },
                {
                    field: 'country',
                    tooltip: false,
                    headerTooltip: 'Header custom component',
                    tooltipComponent: CustomHeaderTooltip,
                },
                {
                    field: 'gold',
                    headerTooltip: 'Legacy getter fallback',
                    headerTooltipValueGetter: () => undefined,
                },
            ],
            rowData: [{ athlete: 'A', age: 20, year: 2024, sport: 'Swimming', country: 'Ireland', gold: 1 }],
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
            suppressColumnVirtualisation: true,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;

        await waitFor(() => getByTestId(gridDiv, agTestIdFor.headerCell('athlete')));
        const header = (columnId: string) => getByTestId(gridDiv, agTestIdFor.headerCell(columnId));
        await userEvent.hover(header('athlete'));
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Athlete Name');

        await userEvent.unhover(header('athlete'));
        await waitForTooltips(0);
        await userEvent.hover(header('age'));
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Legacy getter tooltip');

        await userEvent.unhover(header('age'));
        await waitForTooltips(0);
        await userEvent.hover(header('year'));
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Header: Year');
        expect(seenCallbackParams.at(-1)).toMatchObject({ location: 'header', value: 'Year' });

        await userEvent.unhover(header('year'));
        await waitForTooltips(0);
        await userEvent.hover(header('sport'));
        await asyncSetTimeout(0);
        expect(getTooltips()).toHaveLength(0);

        await userEvent.unhover(header('sport'));
        await userEvent.hover(header('country'));
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Custom: Header custom component');

        await userEvent.unhover(header('country'));
        await waitForTooltips(0);
        await userEvent.hover(header('gold'));
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Legacy getter fallback');
    });

    test('refreshed custom headers preserve their tooltip value and use the current tooltip component', async () => {
        class OwnedHeader implements IHeaderComp {
            private readonly eGui = document.createElement('div');

            public init(params: IHeaderParams): void {
                this.refresh(params);
                params.setTooltip('Owned header tooltip');
            }

            public refresh(params: IHeaderParams): boolean {
                this.eGui.textContent = params.displayName;
                return true;
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        class InitialTooltip implements ITooltipComp {
            private readonly eGui = document.createElement('div');

            public init(params: ITooltipParams): void {
                this.eGui.textContent = `Initial: ${params.value}`;
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        class CurrentTooltip implements ITooltipComp {
            private readonly eGui = document.createElement('div');

            public init(params: ITooltipParams): void {
                this.eGui.textContent = `Current: ${params.value}`;
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        const api = await gridMgr.createGridAndWait('tooltip-header-owned-refresh', {
            columnDefs: [
                {
                    field: 'athlete',
                    headerName: 'Initial header',
                    headerComponent: OwnedHeader,
                    headerTooltip: false,
                    tooltipComponent: InitialTooltip,
                },
            ],
            rowData: [{ athlete: 'A' }],
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;

        api.setGridOption('columnDefs', [
            {
                field: 'athlete',
                headerName: 'Current header',
                headerComponent: OwnedHeader,
                headerTooltip: false,
                tooltipComponent: CurrentTooltip,
            },
        ]);
        const header = await waitFor(() => {
            const current = getByTestId(gridDiv, agTestIdFor.headerCell('athlete'));
            expect(current).toHaveTextContent('Current header');
            return current;
        });

        await userEvent.hover(header);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Current: Owned header tooltip');
    });

    test('does not attach touch listeners to each tooltip cell', async () => {
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        let cellTouchListeners = 0;
        const listenerSpy = vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(function (
            this: EventTarget,
            type: string,
            listener: EventListenerOrEventListenerObject | null,
            options?: boolean | AddEventListenerOptions
        ): void {
            if (type.startsWith('touch') && this instanceof HTMLElement && this.classList.contains('ag-cell')) {
                cellTouchListeners++;
            }
            Reflect.apply(originalAddEventListener, this, [type, listener, options]);
        });

        try {
            const api = await gridMgr.createGridAndWait('tooltip-touch-listener-count', {
                columnDefs: [
                    { field: 'athlete', tooltip: true },
                    { field: 'country', tooltip: true },
                ],
                rowData: [
                    { athlete: 'A', country: 'Ireland' },
                    { athlete: 'B', country: 'France' },
                ],
            });
            const gridDiv = getGridElement(api)! as HTMLElement;
            await waitFor(() => expect(gridDiv.querySelectorAll('.ag-cell')).toHaveLength(4));

            expect(cellTouchListeners).toBe(0);
        } finally {
            listenerSpy.mockRestore();
        }
    });

    test('long press shows cell and header tooltips without triggering the header tap action', async () => {
        const api = await gridMgr.createGridAndWait('tooltip-touch-long-press', {
            columnDefs: [{ field: 'athlete', sortable: true, tooltip: true, headerTooltip: true }],
            rowData: [{ athlete: 'A' }],
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'athlete')));
        const header = getByTestId(gridDiv, agTestIdFor.headerCell('athlete'));
        const headerText = header.querySelector('.ag-header-cell-text') as HTMLElement;

        const cellTouch = touchStart(cell);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('A');
        touchEnd(cellTouch);

        const dismissTouch = touchStart(gridDiv, 2);
        await waitForTooltips(0);
        touchEnd(dismissTouch);

        const headerTouch = touchStart(headerText, 3);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Athlete');
        expect(api.getColumn('athlete')?.getSort()).toBeNull();
        touchEnd(headerTouch);

        const tapTouch = touchStart(headerText, 4);
        touchEnd(tapTouch);
        expect(api.getColumn('athlete')?.getSort()).toBe('asc');

        await waitForTooltips(0);
        header.dispatchEvent(new MouseEvent('mouseenter'));
        await asyncSetTimeout(0);
        expect(getTooltips()).toHaveLength(0);
    });
});
