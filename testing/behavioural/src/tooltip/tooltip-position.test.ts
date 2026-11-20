import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { AgPromise } from 'ag-stack';
import {
    AdvancedFilterBuilderHarness,
    TestGridsManager,
    getVisibleTooltips,
    installFilterLayoutMock,
    installMockResizeObserver,
    selectRichSelectRow,
    triggerResizeObservers,
    uninstallFilterLayoutMock,
    waitForTooltips,
} from 'ag-test-utils';

import { AllCommunityModule, getGridElement } from 'ag-grid-community';
import type {
    ColDef,
    ICellRendererParams,
    IRichCellEditorRendererParams,
    ISetFilterCellRendererParams,
    ITooltipComp,
    ITooltipParams,
    TooltipPositionParams,
} from 'ag-grid-community';
import {
    AdvancedFilterModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    PivotModule,
    RichSelectModule,
    RowGroupingModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

describe('Tooltip positioning callbacks', () => {
    const gridMgr = new TestGridsManager({
        modules: [
            AllCommunityModule,
            AdvancedFilterModule,
            RowGroupingModule,
            ColumnsToolPanelModule,
            FiltersToolPanelModule,
            PivotModule,
            SetFilterModule,
            RichSelectModule,
        ],
    });
    let componentParams: ITooltipParams | undefined;
    let uninstallResizeObserver: (() => void) | undefined;
    class RecordingTooltip implements ITooltipComp {
        private readonly gui = document.createElement('div');

        public init(params: ITooltipParams): void {
            componentParams = params;
            this.gui.textContent = String(params.value);
        }

        public getGui(): HTMLElement {
            return this.gui;
        }
    }

    beforeEach(() => {
        componentParams = undefined;
    });

    afterEach(() => {
        gridMgr.reset();
        uninstallResizeObserver?.();
        uninstallResizeObserver = undefined;
        uninstallFilterLayoutMock();
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test.each(['hover', 'focus'] as const)(
        'passes the underlying cell value and %s trigger, not the resolved tooltip text',
        async (trigger) => {
            const positions: TooltipPositionParams[] = [];
            const data = { raw: 7 };
            const context = { source: 'position regression' };
            const api = await gridMgr.createGridAndWait('tooltip-position-source-value', {
                columnDefs: [
                    {
                        colId: 'value',
                        valueGetter: ({ data }) => data.raw * 2,
                        valueFormatter: ({ value }) => `$${value}.00`,
                        tooltip: ({ valueFormatted }) => `Details: ${valueFormatted}`,
                    },
                ],
                rowData: [data],
                context,
                tooltipTrigger: 'hoverOrFocus',
                tooltipShowDelay: 0,
                tooltipPosition: (params) => {
                    positions.push(params);
                    return 'bottom-end';
                },
            });
            const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!;
            if (trigger === 'hover') {
                cell.dispatchEvent(new MouseEvent('mouseenter', { clientX: 30, clientY: 80 }));
            } else {
                cell.focus();
            }

            await waitForTooltips(1);
            expect(getVisibleTooltips()[0]).toHaveTextContent('Details: $14.00');
            expect(positions.length).toBeGreaterThan(0);
            const params = positions.at(-1)!;
            expect(params).toMatchObject({
                trigger,
                location: 'cell',
                value: 14,
                valueFormatted: '$14.00',
                rowIndex: 0,
            });
            expect(params.api).toBe(api);
            expect(params.context).toBe(context);
            expect(params.data).toBe(data);
            expect(params.node).toBe(api.getDisplayedRowAtIndex(0));
            expect(params.column).toBe(api.getColumn('value'));
            expect(params.colDef).toBe(api.getColumn('value')!.getColDef());
        }
    );

    test('passes the header source value and accepts an undefined callback result', async () => {
        const positions: TooltipPositionParams[] = [];
        const column: ColDef<{ value: number }, number> = {
            field: 'value',
            headerName: 'Amount',
            headerTooltip: ({ value }) => `${value?.toUpperCase()} explanation`,
        };
        const api = await gridMgr.createGridAndWait('tooltip-position-header', {
            columnDefs: [column],
            rowData: [{ value: 7 }],
            tooltipShowDelay: 0,
            tooltipPosition: (params) => {
                positions.push(params);
                return undefined;
            },
        });
        const header = getGridElement(api)!.querySelector<HTMLElement>('.ag-header-cell')!;
        header.dispatchEvent(new MouseEvent('mouseenter'));

        await waitForTooltips(1);
        expect(getVisibleTooltips()[0]).toHaveTextContent('AMOUNT explanation');
        expect(positions.at(-1)).toMatchObject({ trigger: 'hover', location: 'header', value: 'Amount' });
        expect(positions.at(-1)!.column).toBe(api.getColumn('value'));
    });

    test('keeps numeric source values separate from structured tooltip content after an update', async () => {
        const position = vi.fn(() => 'bottom-start' as const);
        const describe = vi.fn(({ value }) => value.label);
        const select = vi.fn(() => ({ component: RecordingTooltip }));
        const column: ColDef<{ value: number }, number> = {
            field: 'value',
            tooltip: ({ value }) => ({ label: `Amount: ${value}` }),
            tooltipComponentSelector: select,
        };
        const api = await gridMgr.createGridAndWait('tooltip-position-structured-value', {
            columnDefs: [column],
            rowData: [{ value: 7 }],
            tooltipTrigger: 'focus',
            tooltipShowDelay: 0,
            tooltipPosition: position,
            getTooltipAriaDescription: describe,
        });
        const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!;

        for (const value of [7, 14]) {
            api.getDisplayedRowAtIndex(0)!.setDataValue('value', value);
            cell.focus();
            await waitForTooltips(1);

            expect(position).toHaveBeenLastCalledWith(expect.objectContaining({ value, location: 'cell' }));
            expect(componentParams?.value).toEqual({ label: `Amount: ${value}` });
            expect(select).toHaveBeenLastCalledWith(expect.objectContaining({ value: componentParams?.value }));
            expect(typeof componentParams?.hideTooltipCallback).toBe('function');
            expect(describe).toHaveBeenLastCalledWith(
                expect.objectContaining({ value: { label: `Amount: ${value}` } })
            );
            expect(describe.mock.calls.at(-1)![0]).not.toHaveProperty('hideTooltipCallback');

            cell.blur();
            await waitForTooltips(0);
        }
    });

    test('passes the validation message as the value for the filter Apply-button tooltip', async () => {
        installFilterLayoutMock();
        const position = vi.fn(() => 'bottom-start' as const);
        const api = await gridMgr.createGridAndWait('tooltip-position-apply-button', {
            columnDefs: [{ field: 'value', filter: true }],
            rowData: [{ value: 7 }],
            enableAdvancedFilter: true,
            tooltipShowDelay: 0,
            tooltipPosition: position,
        });
        const builder = await AdvancedFilterBuilderHarness.open(api);
        await builder.addCondition();
        const apply = getGridElement(api)!.querySelector<HTMLButtonElement>(
            '.ag-advanced-filter-builder [data-ref="applyFilterButton"]'
        )!;
        expect(apply).toBeDisabled();

        vi.useFakeTimers();
        apply.dispatchEvent(new MouseEvent('mouseenter'));
        await vi.advanceTimersByTimeAsync(999);
        expect(getVisibleTooltips()).toHaveLength(0);
        await vi.advanceTimersByTimeAsync(1);

        expect(getVisibleTooltips()).toHaveLength(1);
        expect(getVisibleTooltips()[0]).toHaveTextContent('Not all conditions are complete.');
        expect(position).toHaveBeenCalledWith(
            expect.objectContaining({
                trigger: 'hover',
                location: 'filter',
                value: 'Not all conditions are complete.',
            })
        );
    });

    test.each([
        { panel: 'columns', kind: 'column', location: 'columnToolPanelColumn' },
        { panel: 'columns', kind: 'group', location: 'columnToolPanelColumnGroup' },
        { panel: 'filters', kind: 'column', location: 'filterToolPanelColumnGroup' },
        { panel: 'filters', kind: 'group', location: 'filterToolPanelColumnGroup' },
    ])(
        'passes the display name for the $panel panel $kind heading, not its tooltip text',
        async ({ panel, kind, location }) => {
            const position = vi.fn(() => 'bottom-start' as const);
            const displayName = kind === 'group' ? 'Metrics' : 'Amount';
            const api = await gridMgr.createGridAndWait('tooltip-position-tool-panel', {
                columnDefs: [
                    {
                        groupId: 'metrics',
                        headerName: 'Metrics',
                        headerTooltip: ({ value }) => `Details: ${value}`,
                        tooltipComponent: RecordingTooltip,
                        children: [{ field: 'grouped' }],
                    },
                    { field: 'value', headerName: 'Amount' },
                ],
                defaultColDef: {
                    filter: 'agTextColumnFilter',
                    headerTooltip: ({ value }) => `Details: ${value}`,
                    tooltipComponent: RecordingTooltip,
                },
                rowData: [{ grouped: 'A', value: 7 }],
                sideBar: panel,
                tooltipShowDelay: 0,
                tooltipPosition: position,
            });
            const grid = getGridElement(api)!;
            if (panel === 'columns') {
                const viewport = grid.querySelector<HTMLElement>('.ag-column-select-virtual-list-viewport')!;
                Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
                viewport.dispatchEvent(new Event('scroll'));
            }
            const labelSelector =
                panel === 'columns' ? '.ag-column-select-column-label' : '.ag-filter-toolpanel-header .ag-group-title';
            const sourceSelector = panel === 'columns' ? '[role="treeitem"]' : '.ag-filter-toolpanel-header';
            const source = await waitFor(() => {
                const label = Array.from(grid.querySelectorAll<HTMLElement>(labelSelector)).find(
                    (element) => element.textContent === displayName
                );
                expect(label).toBeDefined();
                return label!.closest<HTMLElement>(sourceSelector)!;
            });
            source.dispatchEvent(new MouseEvent('mouseenter'));

            await waitForTooltips(1);
            expect(componentParams?.value).toBe(`Details: ${displayName}`);
            expect(getVisibleTooltips()[0]).toHaveTextContent(`Details: ${displayName}`);
            expect(position).toHaveBeenCalledWith(
                expect.objectContaining({
                    trigger: 'hover',
                    location,
                    value: displayName,
                    valueFormatted: displayName,
                    column: kind === 'group' ? api.getProvidedColumnGroup('metrics') : api.getColumn('value'),
                })
            );
        }
    );

    test.each([
        { zone: 'rowgroup', field: 'country', displayName: 'Country', location: 'rowGroupColumnsList' },
        { zone: 'pivot', field: 'sport', displayName: 'Sport', location: 'pivotColumnsList' },
        { zone: 'aggregation', field: 'total', displayName: 'Total', location: 'valueColumnsList' },
    ])(
        'passes the display name for a $zone pill, not its tooltip text',
        async ({ zone, field, displayName, location }) => {
            const position = vi.fn(() => 'bottom-start' as const);
            const api = await gridMgr.createGridAndWait('tooltip-position-pill', {
                columnDefs: [
                    { field: 'country', rowGroup: true },
                    { field: 'sport', pivot: true },
                    { field: 'total', aggFunc: 'sum' },
                ],
                defaultColDef: {
                    headerTooltip: ({ value }) => `Details: ${value}`,
                    tooltipComponent: RecordingTooltip,
                },
                rowData: [{ country: 'Ireland', sport: 'Swimming', total: 3 }],
                pivotMode: true,
                sideBar: 'columns',
                tooltipShowDelay: 0,
                tooltipPosition: position,
            });
            const source = await waitFor(() => {
                const pill = getGridElement(api)!.querySelector<HTMLElement>(
                    `.ag-column-drop-vertical.ag-column-drop-${zone} .ag-column-drop-cell`
                );
                expect(pill).not.toBeNull();
                return pill!;
            });
            source.dispatchEvent(new MouseEvent('mouseenter'));

            await waitForTooltips(1);
            expect(componentParams?.value).toBe(`Details: ${displayName}`);
            expect(getVisibleTooltips()[0]).toHaveTextContent(`Details: ${displayName}`);
            expect(position).toHaveBeenCalledWith(
                expect.objectContaining({
                    trigger: 'hover',
                    location,
                    value: displayName,
                    valueFormatted: displayName,
                    column: api.getColumn(field),
                })
            );
        }
    );

    test.each(['formatted', 'renderer'] as const)(
        'passes the raw set filter value, not its %s tooltip content',
        async (content) => {
            const position = vi.fn(() => 'bottom-start' as const);
            const cellRenderer = (params: ISetFilterCellRendererParams) => {
                params.setTooltip(`Details: ${params.valueFormatted}`, () => true);
                return params.valueFormatted ?? '';
            };
            const api = await gridMgr.createGridAndWait('tooltip-position-set-filter', {
                columnDefs: [
                    {
                        field: 'value',
                        filter: 'agSetColumnFilter',
                        tooltipComponent: RecordingTooltip,
                        filterParams: {
                            showTooltips: true,
                            valueFormatter: ({ value }: { value: number }) => `$${value}.00`,
                            cellRenderer: content === 'renderer' ? cellRenderer : undefined,
                        },
                    },
                ],
                rowData: [{ value: 7 }, { value: 14 }],
                tooltipTrigger: 'hover',
                tooltipShowDelay: 0,
                tooltipPosition: position,
            });
            const grid = getGridElement(api)!;
            api.showColumnFilter('value');
            const viewport = await waitFor(() => {
                const element = grid.querySelector<HTMLElement>('.ag-set-filter-list .ag-virtual-list-viewport');
                expect(element).not.toBeNull();
                return element!;
            });
            Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
            viewport.dispatchEvent(new Event('scroll'));
            const source = await waitFor(() => {
                const item = Array.from(grid.querySelectorAll<HTMLElement>('.ag-set-filter-item')).find(
                    (element) => element.textContent?.trim() === '$14.00'
                );
                expect(item).toBeDefined();
                return item!.closest<HTMLElement>('[tabindex]')!;
            });
            source.dispatchEvent(new MouseEvent('mouseenter'));

            await waitForTooltips(1);
            const tooltipText = content === 'renderer' ? 'Details: $14.00' : '$14.00';
            expect(componentParams?.value).toBe(tooltipText);
            expect(componentParams?.valueFormatted).toBe('$14.00');
            expect(getVisibleTooltips()[0]).toHaveTextContent(tooltipText);
            expect(position).toHaveBeenCalledWith(
                expect.objectContaining({
                    trigger: 'hover',
                    location: 'setFilterValue',
                    value: 14,
                    valueFormatted: '$14.00',
                    column: api.getColumn('value'),
                    colDef: api.getColumn('value')!.getColDef(),
                })
            );
        }
    );

    test.each(['select', 'listItem'] as const)('passes raw Select values to callbacks for %s', async (location) => {
        const position = vi.fn(() => 'bottom-start' as const);
        const interaction = vi.fn(() => false);
        const api = await gridMgr.createGridAndWait('tooltip-select-source-values', {
            columnDefs: [
                {
                    field: 'value',
                    editable: true,
                    valueFormatter: ({ value }) => `$${value}.00`,
                    cellEditor: 'agSelectCellEditor',
                    cellEditorParams: { values: [7, 14] },
                },
            ],
            rowData: [{ value: 7 }],
            components: { agTooltipComponent: RecordingTooltip },
            tooltipShowDelay: 0,
            tooltipPosition: position,
            tooltipInteraction: interaction,
        });
        const grid = getGridElement(api)!;
        api.startEditingCell({ rowIndex: 0, colKey: 'value' });
        const select = await waitFor(() => {
            const element = grid.querySelector<HTMLElement>('.ag-cell .ag-select');
            expect(element).not.toBeNull();
            return element!;
        });
        let source = select;
        let label = select.querySelector<HTMLElement>('.ag-picker-field-display')!;
        if (location === 'listItem') {
            select
                .querySelector('.ag-picker-field-wrapper')!
                .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            source = await waitFor(() => {
                const item = Array.from(grid.querySelectorAll<HTMLElement>('.ag-select-list-item')).find(
                    (element) => element.textContent?.trim() === '$14.00'
                );
                expect(item).toBeDefined();
                return item!;
            });
            label = source.querySelector<HTMLElement>('.ag-list-item-text')!;
        }
        Object.defineProperty(label, 'scrollWidth', { value: 200, configurable: true });
        Object.defineProperty(label, 'clientWidth', { value: 100, configurable: true });
        source.dispatchEvent(new MouseEvent('mouseenter'));

        await waitForTooltips(1);
        const value = location === 'select' ? 7 : 14;
        expect(componentParams?.value).toBe(`$${value}.00`);
        expect(getVisibleTooltips()[0]).toHaveTextContent(`$${value}.00`);
        const expected = expect.objectContaining({ location, value, valueFormatted: `$${value}.00` });
        expect(position).toHaveBeenCalledWith(expected);
        expect(interaction).toHaveBeenCalledWith(expected);
    });

    test('opens Rich Select with browser tooltips and a formatter for object values', async () => {
        const values = [{ name: 'Alpha' }, { name: 'Beta' }];
        const formatValue = vi.fn((value: { name: string }) => value.name);
        const api = await gridMgr.createGridAndWait('tooltip-rich-select-native', {
            columnDefs: [
                {
                    field: 'value',
                    cellDataType: false,
                    editable: true,
                    valueFormatter: ({ value }) => value.name,
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: { values, formatValue },
                },
            ],
            rowData: [{ value: values[0] }],
            enableBrowserTooltips: true,
        });
        const grid = getGridElement(api)!;
        api.startEditingCell({ rowIndex: 0, colKey: 'value' });
        const viewport = await waitFor(() => {
            const element = grid.querySelector<HTMLElement>('.ag-rich-select-virtual-list-viewport');
            expect(element).not.toBeNull();
            return element!;
        });
        Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));
        await waitFor(() => expect(grid.querySelectorAll('.ag-rich-select-row')).toHaveLength(2));
        expect(Array.from(grid.querySelectorAll('.ag-rich-select-row'), (row) => row.getAttribute('title'))).toEqual([
            'Alpha',
            'Beta',
        ]);
        expect(formatValue.mock.calls.every(([value]) => values.includes(value))).toBe(true);
        expect(grid.querySelector('.ag-rich-select')).toHaveAttribute('title', 'Alpha');
    });

    test.each(['formatted', 'renderer'] as const)(
        'passes the raw Rich Select item, not its %s tooltip content',
        async (content) => {
            const position = vi.fn(() => 'bottom-start' as const);
            const cellRenderer = (params: IRichCellEditorRendererParams<number>) => {
                params.setTooltip(`Details: ${params.valueFormatted}`, () => true);
                return params.valueFormatted ?? '';
            };
            const api = await gridMgr.createGridAndWait('tooltip-position-rich-select-item', {
                columnDefs: [
                    {
                        field: 'value',
                        editable: true,
                        cellEditor: 'agRichSelectCellEditor',
                        cellEditorParams: {
                            values: [7, 14],
                            formatValue: (value: number) => `$${value}.00`,
                            cellRenderer: content === 'renderer' ? cellRenderer : undefined,
                        },
                    },
                ],
                rowData: [{ value: 7 }],
                components: { agTooltipComponent: RecordingTooltip },
                tooltipTrigger: 'hover',
                tooltipShowDelay: 0,
                tooltipPosition: position,
            });
            const grid = getGridElement(api)!;
            api.startEditingCell({ rowIndex: 0, colKey: 'value' });
            const viewport = await waitFor(() => {
                const element = grid.querySelector<HTMLElement>('.ag-rich-select-virtual-list-viewport');
                expect(element).not.toBeNull();
                return element!;
            });
            Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
            viewport.dispatchEvent(new Event('scroll'));
            const source = await waitFor(() => {
                const row = Array.from(grid.querySelectorAll<HTMLElement>('.ag-rich-select-row')).find(
                    (element) => element.textContent?.trim() === '$14.00'
                );
                expect(row).toBeDefined();
                return row!;
            });
            if (content === 'formatted') {
                const label = source.querySelector('span')!;
                Object.defineProperty(label, 'scrollWidth', { value: 200, configurable: true });
                Object.defineProperty(label, 'clientWidth', { value: 100, configurable: true });
            }
            source.dispatchEvent(new MouseEvent('mouseenter'));

            await waitForTooltips(1);
            const tooltipText = content === 'renderer' ? 'Details: $14.00' : '$14.00';
            expect(componentParams?.value).toBe(tooltipText);
            expect(getVisibleTooltips()[0]).toHaveTextContent(tooltipText);
            expect(position).toHaveBeenCalledWith(
                expect.objectContaining({
                    trigger: 'hover',
                    location: 'richSelectListItem',
                    value: 14,
                    valueFormatted: '$14.00',
                })
            );
            expect(componentParams).not.toHaveProperty('valueFormatted');
        }
    );

    test.each([
        { content: 'formatted', multiSelect: false },
        { content: 'renderer', multiSelect: false },
        { content: 'formatted', multiSelect: true },
        { content: 'renderer', multiSelect: true },
    ])(
        'passes the current Rich Select value, not its $content tooltip content (multiSelect: $multiSelect)',
        async ({ content, multiSelect }) => {
            const position = vi.fn(() => 'bottom-start' as const);
            const cellRenderer = (params: IRichCellEditorRendererParams<number>) => {
                params.setTooltip(`Details: ${params.valueFormatted}`, () => true);
                return params.valueFormatted ?? '';
            };
            const api = await gridMgr.createGridAndWait('tooltip-position-rich-select-value', {
                columnDefs: [
                    {
                        field: 'value',
                        cellDataType: false,
                        editable: true,
                        cellEditor: 'agRichSelectCellEditor',
                        cellEditorParams: {
                            values: [7, 14],
                            formatValue: (value: number) => `$${value}.00`,
                            cellRenderer: content === 'renderer' ? cellRenderer : undefined,
                            multiSelect,
                            suppressMultiSelectPillRenderer: true,
                        },
                    },
                ],
                rowData: [{ value: multiSelect ? [7] : 7 }],
                components: { agTooltipComponent: RecordingTooltip },
                tooltipTrigger: 'hover',
                tooltipShowDelay: 0,
                tooltipPosition: position,
            });
            const grid = getGridElement(api)!;
            api.startEditingCell({ rowIndex: 0, colKey: 'value' });
            const source = await waitFor(() => {
                const element = grid.querySelector<HTMLElement>('.ag-rich-select');
                expect(element).not.toBeNull();
                return element!;
            });
            const viewport = await waitFor(() => {
                const element = grid.querySelector<HTMLElement>('.ag-rich-select-virtual-list-viewport');
                expect(element).not.toBeNull();
                return element!;
            });
            Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
            viewport.dispatchEvent(new Event('scroll'));
            if (multiSelect) {
                await selectRichSelectRow('$14.00', grid);
            }
            const label = source.querySelector<HTMLElement>('.ag-picker-field-display')!;
            Object.defineProperty(label, 'scrollWidth', { value: 200, configurable: true });
            Object.defineProperty(label, 'clientWidth', { value: 100, configurable: true });
            source.dispatchEvent(new MouseEvent('mouseenter'));

            await waitForTooltips(1);
            const valueFormatted = multiSelect ? '$7.00, $14.00' : '$7.00';
            const tooltipText = content === 'renderer' ? `Details: ${valueFormatted}` : valueFormatted;
            expect(componentParams?.value).toBe(tooltipText);
            expect(componentParams).not.toHaveProperty('valueFormatted');
            expect(getVisibleTooltips()[0]).toHaveTextContent(tooltipText);
            expect(position).toHaveBeenCalledWith(
                expect.objectContaining({
                    trigger: 'hover',
                    location: 'richSelectValue',
                    value: multiSelect ? [7, 14] : 7,
                    valueFormatted,
                })
            );
        }
    );

    test('positions an asynchronously initialised custom tooltip before post-processing and preserves customer styles', async () => {
        uninstallResizeObserver = installMockResizeObserver();
        let finishInit: (() => void) | undefined;
        const popups: Array<{ position: string | undefined; hasClass: boolean; arrowOffset: string }> = [];
        class DelayedTooltip implements ITooltipComp {
            private readonly gui = document.createElement('div');

            public init(params: ITooltipParams): AgPromise<void> {
                componentParams = params;
                return new AgPromise((resolve) => {
                    finishInit = () => {
                        this.gui.textContent = String(params.value);
                        resolve();
                    };
                });
            }

            public getGui(): HTMLElement {
                return this.gui;
            }
        }

        const api = await gridMgr.createGridAndWait('tooltip-position-async', {
            columnDefs: [{ field: 'value', tooltip: 'Custom content', tooltipComponent: DelayedTooltip }],
            rowData: [{ value: 7 }],
            tooltipShowDelay: 0,
            tooltipPosition: 'bottom-start',
            postProcessPopup: ({ type, ePopup, tooltipPosition }) => {
                if (type !== 'tooltip') {
                    return;
                }
                popups.push({
                    position: tooltipPosition,
                    hasClass: ePopup.classList.contains(`ag-tooltip-position-${tooltipPosition}`),
                    arrowOffset: ePopup.style.getPropertyValue('--ag-tooltip-arrow-offset'),
                });
                ePopup.style.left = '37px';
                ePopup.style.top = '41px';
                ePopup.style.setProperty('--ag-tooltip-arrow-offset', '19px');
            },
        });
        getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!.dispatchEvent(new MouseEvent('mouseenter'));
        await waitFor(() => expect(finishInit).toBeDefined());
        expect(getVisibleTooltips()).toHaveLength(0);
        expect(popups).toHaveLength(0);

        vi.useFakeTimers();
        finishInit!();
        triggerResizeObservers(getVisibleTooltips()[0]);
        // Includes any deferred first-position pass after the component has attached.
        await vi.advanceTimersByTimeAsync(1000);
        expect(getVisibleTooltips()).toHaveLength(1);
        expect(componentParams?.value).toBe('Custom content');
        expect(popups.length).toBeGreaterThan(0);
        for (const popup of popups) {
            expect(popup.position).toMatch(/^(top|bottom|left|right)(-start|-end)?$/);
            expect(popup.hasClass).toBe(true);
            expect(popup.arrowOffset).not.toBe('');
        }
        const tooltip = getVisibleTooltips()[0];
        expect(tooltip).toHaveTextContent('Custom content');
        expect(tooltip.style.left).toBe('37px');
        expect(tooltip.style.top).toBe('41px');
        expect(tooltip.style.getPropertyValue('--ag-tooltip-arrow-offset')).toBe('19px');
    });

    test('repositions a tooltip resized by its initial postProcessPopup callback', async () => {
        uninstallResizeObserver = installMockResizeObserver();
        const postProcessPopup = vi.fn(({ ePopup }) => {
            Object.defineProperty(ePopup, 'offsetHeight', { value: 100, configurable: true });
            Object.defineProperty(ePopup, 'clientHeight', { value: 100, configurable: true });
        });
        const api = await gridMgr.createGridAndWait('tooltip-position-initial-resize', {
            columnDefs: [{ field: 'value', tooltip: true, tooltipComponent: RecordingTooltip }],
            rowData: [{ value: 7 }],
            tooltipTrigger: 'focus',
            tooltipShowDelay: 0,
            postProcessPopup,
        });
        vi.useFakeTimers();
        getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!.focus();
        await vi.advanceTimersByTimeAsync(0);
        expect(getVisibleTooltips()).toHaveLength(1);
        expect(postProcessPopup).toHaveBeenCalledTimes(1);

        const tooltip = getVisibleTooltips()[0];
        triggerResizeObservers(tooltip);
        expect(postProcessPopup).toHaveBeenCalledTimes(2);
        triggerResizeObservers(tooltip);
        expect(postProcessPopup).toHaveBeenCalledTimes(2);
    });

    test('ignores tooltip and unrelated scrolling but dismisses on document scrolling', async () => {
        const api = await gridMgr.createGridAndWait('tooltip-scroll', {
            columnDefs: [{ field: 'value', tooltip: true, tooltipComponent: RecordingTooltip }],
            rowData: [{ value: 7 }],
            tooltipTrigger: 'focus',
            tooltipShowDelay: 0,
        });
        const source = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!;
        source.focus();
        await waitForTooltips(1);
        const tooltip = getVisibleTooltips()[0];
        tooltip.dispatchEvent(new Event('scroll'));
        getGridElement(api)!.querySelector('.ag-header')!.dispatchEvent(new Event('scroll'));
        expect(getVisibleTooltips()).toEqual([tooltip]);

        document.dispatchEvent(new Event('scroll'));
        await waitForTooltips(0);
        expect(source).toHaveFocus();
        expect(source).toHaveAccessibleDescription('7');
    });

    test.each(['hide', 'destroy'] as const)(
        'repositions late content changes and stops observing on %s',
        async (close) => {
            uninstallResizeObserver = installMockResizeObserver();
            const postProcessPopup = vi.fn();
            const api = await gridMgr.createGridAndWait('tooltip-position-late-resize', {
                columnDefs: [{ field: 'value', tooltip: true, tooltipComponent: RecordingTooltip }],
                rowData: [{ value: 7 }],
                tooltipTrigger: 'focus',
                tooltipShowDelay: 0,
                postProcessPopup,
            });
            const source = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!;
            vi.useFakeTimers();
            source.focus();
            await vi.advanceTimersByTimeAsync(0);
            expect(getVisibleTooltips()).toHaveLength(1);
            const tooltip = getVisibleTooltips()[0];
            postProcessPopup.mockClear();
            await vi.advanceTimersByTimeAsync(500);
            Object.defineProperty(tooltip, 'offsetHeight', { value: 100, configurable: true });
            Object.defineProperty(tooltip, 'clientHeight', { value: 100, configurable: true });
            triggerResizeObservers(tooltip);
            expect(postProcessPopup).toHaveBeenCalledTimes(1);
            triggerResizeObservers(tooltip);
            expect(postProcessPopup).toHaveBeenCalledTimes(1);

            if (close === 'hide') {
                componentParams!.hideTooltipCallback!();
            } else {
                api.destroy();
            }
            expect(tooltip).toHaveClass('ag-tooltip-hiding');
            Object.defineProperty(tooltip, 'offsetHeight', { value: 150, configurable: true });
            Object.defineProperty(tooltip, 'clientHeight', { value: 150, configurable: true });
            triggerResizeObservers(tooltip);
            expect(postProcessPopup).toHaveBeenCalledTimes(1);
            await vi.runOnlyPendingTimersAsync();
            expect(tooltip.isConnected).toBe(false);
        }
    );

    test('passes the source value for a full-width group row, not its resolved tooltip', async () => {
        const position = vi.fn(() => 'right' as const);
        const api = await gridMgr.createGridAndWait('tooltip-position-full-width', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, tooltip: ({ value }) => `Country: ${value}` },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Ireland', athlete: 'Alice' }],
            groupDisplayType: 'groupRows',
            tooltipPosition: position,
            tooltipShowDelay: 0,
        });
        getGridElement(api)!
            .querySelector<HTMLElement>('.ag-full-width-row')!
            .dispatchEvent(new MouseEvent('mouseenter'));

        await waitForTooltips(1);
        expect(getVisibleTooltips()[0]).toHaveTextContent('Country: Ireland');
        expect(position).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 'Ireland',
                location: 'fullWidthRow',
                trigger: 'hover',
                node: api.getDisplayedRowAtIndex(0),
            })
        );
    });

    test('native renderer tooltips do not format unused group metadata', async () => {
        let rendererParams: ICellRendererParams;
        const formatter = vi.fn(({ value }) => `Formatted ${value}`);
        const api = await gridMgr.createGridAndWait('native-group-tooltip', {
            columnDefs: [{ field: 'country', rowGroup: true, valueFormatter: formatter }, { field: 'value' }],
            rowData: [{ country: 'Ireland', value: 1 }],
            groupDisplayType: 'groupRows',
            groupRowRenderer: (params: ICellRendererParams) => {
                rendererParams = params;
                return document.createElement('span');
            },
            enableBrowserTooltips: true,
        });
        formatter.mockClear();
        rendererParams!.setTooltip('Custom native text');
        expect(getGridElement(api)!.querySelector('.ag-full-width-row')).toHaveAttribute('title', 'Custom native text');
        expect(formatter).not.toHaveBeenCalled();
    });

    test.each(['hide', 'destroy', 'replacement'] as const)(
        'batches tracked pointer updates and ignores a queued update after %s',
        async (close) => {
            const postProcessPopup = vi.fn();
            const api = await gridMgr.createGridAndWait('tracked-tooltip-frame', {
                columnDefs: [{ field: 'value', tooltip: true, tooltipComponent: RecordingTooltip }],
                rowData: [{ value: 7 }],
                tooltipMouseTrack: true,
                tooltipShowDelay: 0,
                postProcessPopup,
            });
            const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!;
            cell.dispatchEvent(new MouseEvent('mouseenter', { clientX: 10, clientY: 10 }));
            await waitForTooltips(1);
            postProcessPopup.mockClear();
            const frames: FrameRequestCallback[] = [];
            vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
                frames.push(callback);
                return 0;
            });
            for (let i = 0; i < 100; i++) {
                cell.dispatchEvent(new MouseEvent('mousemove', { clientX: 100 + i, clientY: 20 }));
            }
            expect(postProcessPopup).not.toHaveBeenCalled();
            expect(frames).toHaveLength(1);
            frames.shift()!(0);
            expect(postProcessPopup).toHaveBeenCalledTimes(1);
            expect(postProcessPopup).toHaveBeenLastCalledWith(
                expect.objectContaining({ mouseEvent: expect.objectContaining({ clientX: 199 }) })
            );
            postProcessPopup.mockClear();
            cell.dispatchEvent(new MouseEvent('mousemove', { clientX: 210, clientY: 20 }));
            if (close === 'destroy') {
                api.destroy();
            } else {
                componentParams!.hideTooltipCallback!();
                if (close === 'replacement') {
                    cell.dispatchEvent(new MouseEvent('mouseenter', { clientX: 220, clientY: 20 }));
                    await waitForTooltips(1);
                    postProcessPopup.mockClear();
                }
            }
            frames.shift()!(0);
            expect(postProcessPopup).not.toHaveBeenCalled();
        }
    );

    test('native browser tooltips bypass positioning callbacks and popup post-processing', async () => {
        const position = vi.fn(() => 'bottom-end' as const);
        const interaction = vi.fn(() => true);
        const postProcessPopup = vi.fn();
        const api = await gridMgr.createGridAndWait('tooltip-position-native', {
            columnDefs: [{ field: 'value', tooltip: 'Native content' }],
            rowData: [{ value: 7 }],
            enableBrowserTooltips: true,
            tooltipTrigger: 'hoverOrFocus',
            tooltipShowDelay: 0,
            tooltipPosition: position,
            tooltipInteraction: interaction,
            postProcessPopup,
        });
        const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-cell')!;
        vi.useFakeTimers();
        cell.dispatchEvent(new MouseEvent('mouseenter'));
        cell.focus();
        await vi.advanceTimersByTimeAsync(1000);

        expect(cell).toHaveAttribute('title', 'Native content');
        expect(position).not.toHaveBeenCalled();
        expect(interaction).not.toHaveBeenCalled();
        expect(postProcessPopup).not.toHaveBeenCalled();
        expect(getVisibleTooltips()).toHaveLength(0);
    });
});
