import { fireEvent, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import {
    TestGridsManager,
    getVisibleTooltips,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type {
    ColDef,
    GridOptions,
    IBuiltInTooltipParams,
    ICellRendererParams,
    IHeaderParams,
    ITooltipParams,
    SetFilterHandler,
    ValueFormatterFunc,
} from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

class CustomTooltip {
    private readonly eGui = document.createElement('div');

    public init({ value, prefix }: ITooltipParams & { prefix: string }): void {
        this.eGui.textContent = `${prefix}: ${value}`;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}

describe('Automatic truncated-text tooltips', () => {
    const grids = new TestGridsManager({ modules: [AllEnterpriseModule] });
    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());

    afterEach(() => {
        grids.reset();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    const createGrid = async (options: GridOptions = {}) => {
        const api = await grids.createGridAndWait('automatic-tooltip', {
            columnDefs: [{ field: 'value' }],
            rowData: [{ value: 'Displayed value' }],
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
            ...options,
        });
        vi.useFakeTimers();
        return { api, grid: getGridElement(api)! as HTMLElement };
    };

    const setTruncated = (element: HTMLElement, truncated: boolean) => {
        vi.spyOn(element, 'clientWidth', 'get').mockReturnValue(100);
        vi.spyOn(element, 'scrollWidth', 'get').mockReturnValue(truncated ? 200 : 80);
        vi.spyOn(element, 'clientHeight', 'get').mockReturnValue(20);
        vi.spyOn(element, 'scrollHeight', 'get').mockReturnValue(20);
    };

    const hover = async (element: HTMLElement) => {
        fireEvent.mouseEnter(element);
        await vi.advanceTimersByTimeAsync(1);
    };

    test.each<{
        name: string;
        tooltip?: ColDef['tooltip'];
        mode?: GridOptions['tooltipShowMode'];
        truncated: boolean;
        expected?: string;
    }>([
        { name: 'automatic truncated value', truncated: true, expected: 'Displayed value' },
        { name: 'automatic fitting value', truncated: false },
        { name: 'standard has no automatic content', mode: 'standard', truncated: true },
        { name: 'explicit true requires truncation', tooltip: true, truncated: false },
        { name: 'explicit true with truncation', tooltip: true, truncated: true, expected: 'Displayed value' },
        { name: 'matching string requires truncation', tooltip: 'Displayed value', truncated: false },
        { name: 'matching callback requires truncation', tooltip: ({ value }) => value, truncated: false },
        {
            name: 'different text does not require truncation',
            tooltip: 'Additional information',
            truncated: false,
            expected: 'Additional information',
        },
        {
            name: 'standard shows matching text',
            mode: 'standard',
            tooltip: true,
            truncated: false,
            expected: 'Displayed value',
        },
        { name: 'false suppresses automatic content', tooltip: false, truncated: true },
        { name: 'empty callback suppresses automatic content', tooltip: () => '', truncated: true },
        { name: 'null callback suppresses automatic content', tooltip: () => null, truncated: true },
        { name: 'undefined callback suppresses automatic content', tooltip: () => undefined, truncated: true },
    ])('$name', async ({ tooltip, mode, truncated, expected }) => {
        const { grid } = await createGrid({ columnDefs: [{ field: 'value', tooltip }], tooltipShowMode: mode });
        const cell = grid.querySelector<HTMLElement>('.ag-cell')!;
        setTruncated(cell, truncated);
        await hover(cell);
        expect(getVisibleTooltips().map((element) => element.textContent)).toEqual(expected ? [expected] : []);
    });

    test.each([undefined, '42', '$42'])(
        'compares against the default formatted value without losing formatting (%s)',
        async (tooltip) => {
            const { grid } = await createGrid({
                columnDefs: [{ field: 'value', valueFormatter: ({ value }) => `$${value}`, tooltip }],
                rowData: [{ value: 42 }],
            });
            const cell = grid.querySelector<HTMLElement>('.ag-cell')!;
            setTruncated(cell, false);
            await hover(cell);
            expect(getVisibleTooltips().map((element) => element.textContent)).toEqual(tooltip === '42' ? ['42'] : []);
            fireEvent.mouseLeave(cell);
            await vi.advanceTimersByTimeAsync(1000);
            setTruncated(cell, true);
            await hover(cell);
            expect(getVisibleTooltips()[0]).toHaveTextContent(tooltip ?? '$42');
        }
    );

    test.each([false, true])('previews truncated Find-highlighted cells (native=%s)', async (native) => {
        const { grid } = await createGrid({
            columnDefs: [
                { field: 'value' },
                { colId: 'configured', field: 'value', tooltip: true },
                { colId: 'selector', field: 'value', cellRendererSelector: () => undefined },
                {
                    colId: 'configuredSelector',
                    field: 'value',
                    tooltip: true,
                    cellRendererSelector: () => undefined,
                },
            ],
            findSearchValue: 'Displayed',
            enableBrowserTooltips: native,
        });
        for (const cell of grid.querySelectorAll<HTMLElement>('.ag-cell')) {
            expect(cell.querySelector('.ag-find-match')).toHaveTextContent('Displayed');
            setTruncated(cell, true);
            await hover(cell);
            if (native) {
                expect(cell).toHaveAttribute('title', 'Displayed value');
            } else {
                expect(getVisibleTooltips()[0]).toHaveTextContent('Displayed value');
            }
            fireEvent.mouseLeave(cell);
            await vi.advanceTimersByTimeAsync(1000);
            setTruncated(cell, false);
            await hover(cell);
            if (native) {
                expect(cell).toHaveAttribute('title', '');
            }
            expect(getVisibleTooltips()).toHaveLength(0);
            fireEvent.mouseLeave(cell);
        }
    });

    test.each([false, true])(
        'uses the source component or default for text tooltips (configured=%s)',
        async (configured) => {
            const received: IBuiltInTooltipParams[] = [];
            class BuiltInTooltip {
                private eGui = document.createElement('div');
                public init(params: IBuiltInTooltipParams): void {
                    received.push(params);
                    this.eGui.textContent = params.text;
                }
                public getGui(): HTMLElement {
                    return this.eGui;
                }
            }
            const { api, grid } = await createGrid({
                defaultColDef: { tooltip: configured || undefined, headerTooltip: configured || undefined },
                columnDefs: [
                    {
                        headerName: 'Group',
                        headerTooltip: configured || undefined,
                        tooltipComponentSelector: () => ({ component: CustomTooltip, params: { prefix: 'Group' } }),
                        children: [
                            {
                                field: 'value',
                                tooltipComponent: CustomTooltip,
                                tooltipComponentParams: { prefix: 'Column' },
                            },
                        ],
                    },
                    { colId: 'fallback', field: 'value' },
                ],
                builtInTooltipComponent: BuiltInTooltip,
            });
            for (const [selector, labelSelector, expected] of [
                ['.ag-cell[col-id="value"]', '', 'Column: Displayed value'],
                ['.ag-header-cell[col-id="value"]', '.ag-header-cell-text', 'Column: Value'],
                ['.ag-header-group-cell:not(.ag-header-span-height)', '.ag-header-group-text', 'Group: Group'],
                ['.ag-cell[col-id="fallback"]', '', 'Displayed value'],
            ]) {
                const source = grid.querySelector<HTMLElement>(selector)!;
                setTruncated(labelSelector ? source.querySelector<HTMLElement>(labelSelector)! : source, true);
                await hover(source);
                expect(getVisibleTooltips()[0]).toHaveTextContent(expected);
                const tooltip = getVisibleTooltips()[0];
                api.setGridOption('suppressBuiltInTooltips', true);
                await vi.advanceTimersByTimeAsync(1);
                expect(getVisibleTooltips()).toEqual([tooltip]);
                fireEvent.mouseLeave(source);
                await vi.advanceTimersByTimeAsync(1000);
            }
            expect(received).toHaveLength(0);
        }
    );

    test.each([undefined, true, 'Additional information'])(
        'does not infer truncation in a custom renderer (%s)',
        async (tooltip) => {
            const { grid } = await createGrid({
                columnDefs: [
                    {
                        field: 'value',
                        cellRenderer: ({ value }: ICellRendererParams) => `<span>${value}</span>`,
                        tooltip,
                    },
                ],
            });
            const cell = grid.querySelector<HTMLElement>('.ag-cell')!;
            setTruncated(cell, true);
            await hover(cell);
            expect(getVisibleTooltips().map((element) => element.textContent)).toEqual(
                typeof tooltip === 'string' ? [tooltip] : []
            );
        }
    );

    test.each([false, true])('uses a custom renderer truncation predicate (%s)', async (truncated) => {
        const shouldDisplay = vi.fn(() => truncated);
        const { grid } = await createGrid({
            columnDefs: [
                {
                    field: 'value',
                    tooltip: false,
                    cellRenderer: (params: ICellRendererParams) => {
                        params.setTooltip(params.value, shouldDisplay);
                        return `<span>${params.value}</span>`;
                    },
                },
            ],
        });
        await hover(grid.querySelector<HTMLElement>('.ag-cell')!);
        expect(shouldDisplay).toHaveBeenCalled();
        expect(getVisibleTooltips().map((element) => element.textContent)).toEqual(
            truncated ? ['Displayed value'] : []
        );
    });

    test('does not infer truncation from a selected custom renderer matching Find', async () => {
        const { grid } = await createGrid({
            columnDefs: [
                {
                    field: 'value',
                    tooltip: true,
                    cellRendererSelector: () => ({ component: () => '<span>Custom content</span>' }),
                },
            ],
            findSearchValue: 'Displayed',
            enableBrowserTooltips: true,
        });
        const cell = grid.querySelector<HTMLElement>('.ag-cell')!;
        expect(cell).toHaveTextContent('Custom content');
        setTruncated(cell, true);
        await hover(cell);
        expect(cell.getAttribute('title') || undefined).toBeUndefined();
    });

    test('updates native titles on hover and data changes', async () => {
        const { api, grid } = await createGrid({ enableBrowserTooltips: true });
        const cell = grid.querySelector<HTMLElement>('.ag-cell')!;
        setTruncated(cell, false);
        await hover(cell);
        expect(cell).toHaveAttribute('title', '');
        fireEvent.mouseLeave(cell);
        setTruncated(cell, true);
        await hover(cell);
        expect(cell).toHaveAttribute('title', 'Displayed value');
        api.getDisplayedRowAtIndex(0)!.setDataValue('value', 'Updated value');
        await vi.advanceTimersByTimeAsync(1);
        expect(cell).toHaveAttribute('title', 'Updated value');
        fireEvent.mouseLeave(cell);
        setTruncated(cell, false);
        await hover(cell);
        expect(cell).toHaveAttribute('title', '');
        expect(getVisibleTooltips()).toHaveLength(0);
    });

    test.each([false, true])('custom headers supply their own truncation check (registered=%s)', async (registered) => {
        class Header {
            private eGui = document.createElement('span');
            public init(params: IHeaderParams): void {
                this.eGui.textContent = params.displayName;
                if (registered) {
                    params.setTooltip(params.displayName, () => true);
                }
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
        }
        const { grid } = await createGrid({
            columnDefs: [{ field: 'value', headerName: 'Custom name', headerComponent: Header, headerTooltip: true }],
        });
        const header = grid.querySelector<HTMLElement>('.ag-header-cell')!;
        setTruncated(header, true);
        await hover(header);
        expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual(registered ? ['Custom name'] : []);
    });

    test('connects focus descriptions and honours Escape dismissal', async () => {
        const { grid } = await createGrid({ tooltipTrigger: 'focus' });
        const cell = grid.querySelector<HTMLElement>('.ag-cell')!;
        setTruncated(cell, true);
        cell.focus();
        expect(cell).toHaveAccessibleDescription('Displayed value');
        await vi.advanceTimersByTimeAsync(1);
        expect(getVisibleTooltips()[0]).toHaveTextContent('Displayed value');
        expect(cell).not.toHaveAttribute('aria-owns');
        fireEvent.keyDown(cell, { key: 'Escape' });
        await vi.advanceTimersByTimeAsync(1);
        expect(getVisibleTooltips()).toHaveLength(0);
        expect(document.activeElement).toBe(cell);
    });

    test.each([false, true])(
        'control-hint suppression leaves automatic native titles unchanged (initial=%s)',
        async (suppressBuiltInTooltips) => {
            const { api, grid } = await createGrid({ enableBrowserTooltips: true, suppressBuiltInTooltips });
            const cell = grid.querySelector<HTMLElement>('.ag-cell')!;
            setTruncated(cell, true);
            await hover(cell);
            expect(cell).toHaveAttribute('title', 'Displayed value');
            api.setGridOption('suppressBuiltInTooltips', !suppressBuiltInTooltips);
            expect(cell).toHaveAttribute('title', 'Displayed value');
            api.setGridOption('suppressBuiltInTooltips', suppressBuiltInTooltips);
            expect(cell).toHaveAttribute('title', 'Displayed value');
        }
    );

    test('native control hints stay suppressed on hover', async () => {
        const { api, grid } = await createGrid({
            enableBrowserTooltips: true,
            suppressBuiltInTooltips: true,
        });
        const menu = grid.querySelector<HTMLElement>('.ag-header-cell-menu-button')!;
        await hover(menu);
        expect(menu).not.toHaveAttribute('title');
        api.setGridOption('suppressBuiltInTooltips', false);
        await hover(menu);
        expect(menu).toHaveAttribute('title', 'Open column menu');
        api.setGridOption('suppressBuiltInTooltips', true);
        await hover(menu);
        expect(menu).not.toHaveAttribute('title');
    });

    test.each(
        (['auto', 'standard', 'whenTruncated', 'whenDifferent'] as const).flatMap((mode) =>
            [undefined, false, true].map((showTooltips) => ({ mode, showTooltips }))
        )
    )('Set Filter items follow showTooltips=$showTooltips in $mode mode', async ({ mode, showTooltips }) => {
        const { api } = await createGrid({
            tooltipShowMode: mode,
            columnDefs: [
                {
                    field: 'value',
                    filter: 'agSetColumnFilter',
                    filterParams: { showTooltips },
                    tooltipComponent: CustomTooltip,
                    tooltipComponentParams: { prefix: 'Item' },
                },
            ],
        });
        vi.useRealTimers();
        api.showColumnFilter('value');
        const label = await waitFor(() => {
            const labels = Array.from(document.querySelectorAll<HTMLElement>('.ag-set-filter-item .ag-label'));
            const label = labels.find((element) => element.textContent === 'Displayed value');
            expect(label).toBeTruthy();
            return label!;
        });
        vi.useFakeTimers();
        const source = label.closest<HTMLElement>('.ag-virtual-list-item')!;
        for (const truncated of [false, true]) {
            setTruncated(label, truncated);
            await hover(source);
            const configured = showTooltips === true;
            const visible =
                (mode === 'auto' && showTooltips !== false && truncated) ||
                (mode === 'standard' && configured) ||
                (mode === 'whenTruncated' && configured && truncated);
            expect(getVisibleTooltips().map((element) => element.textContent)).toEqual(
                visible ? ['Item: Displayed value'] : []
            );
            fireEvent.mouseLeave(source);
            await vi.advanceTimersByTimeAsync(1000);
        }
    });

    test.each(
        (['auto', 'standard', 'whenTruncated', 'whenDifferent'] as const).flatMap((mode) =>
            [undefined, true, 'Group details'].map((tooltip) => ({ mode, tooltip }))
        )
    )('full-width groups follow $mode with tooltip=$tooltip', async ({ mode, tooltip }) => {
        const { grid } = await createGrid({
            tooltipShowMode: mode,
            columnDefs: [{ field: 'value', rowGroup: true, hide: true, tooltip }, { field: 'other' }],
            groupDisplayType: 'groupRows',
            enableBrowserTooltips: true,
        });
        const label = grid.querySelector<HTMLElement>('.ag-group-value')!;
        const source = label.closest<HTMLElement>('.ag-full-width-row')!;
        for (const truncated of [false, true]) {
            setTruncated(label, truncated);
            await hover(source);
            const different = tooltip === 'Group details';
            const visible =
                (mode === 'auto' && (truncated || different)) ||
                (mode === 'standard' && tooltip !== undefined) ||
                (mode === 'whenTruncated' && tooltip !== undefined && truncated) ||
                (mode === 'whenDifferent' && different);
            expect(source.getAttribute('title') || undefined).toBe(
                visible ? (different ? 'Group details' : 'Displayed value') : undefined
            );
            fireEvent.mouseLeave(source);
            await vi.advanceTimersByTimeAsync(1000);
        }
    });

    test.each([
        { kind: 'setFilter', native: false, mode: 'auto' },
        { kind: 'setFilter', native: true, mode: 'auto' },
        { kind: 'fullWidthGroup', native: false, mode: 'auto' },
        { kind: 'fullWidthGroup', native: true, mode: 'auto' },
        { kind: 'setFilter', native: false, mode: 'whenDifferent' },
        { kind: 'setFilter', native: true, mode: 'whenDifferent' },
        { kind: 'fullWidthGroup', native: false, mode: 'whenDifferent' },
        { kind: 'fullWidthGroup', native: true, mode: 'whenDifferent' },
        { kind: 'setFilter', native: false, mode: 'whenTruncated' },
        { kind: 'setFilter', native: true, mode: 'whenTruncated' },
        { kind: 'fullWidthGroup', native: false, mode: 'whenTruncated' },
        { kind: 'fullWidthGroup', native: true, mode: 'whenTruncated' },
        { kind: 'setFilter', native: false, mode: 'standard' },
        { kind: 'setFilter', native: true, mode: 'standard' },
        { kind: 'fullWidthGroup', native: false, mode: 'standard' },
        { kind: 'fullWidthGroup', native: true, mode: 'standard' },
    ] as const)('classifies renderer-supplied text ($kind, native=$native, $mode)', async ({ kind, native, mode }) => {
        type RendererParams = Pick<ICellRendererParams, 'value' | 'valueFormatted' | 'setTooltip'>;
        let rendererParams: RendererParams;
        const renderer = (params: RendererParams) => {
            if (params.value === 'Value') {
                rendererParams = params;
                params.setTooltip(params.value);
            }
            const element = document.createElement('span');
            element.textContent = params.valueFormatted ?? params.value;
            return element;
        };
        const isSetFilter = kind === 'setFilter';
        const valueFormatter: ValueFormatterFunc = ({ value }) => `Formatted ${value}`;
        const { api, grid } = await createGrid({
            columnDefs: [
                {
                    field: 'value',
                    valueFormatter,
                    filter: isSetFilter ? 'agSetColumnFilter' : undefined,
                    filterParams: { cellRenderer: renderer, valueFormatter },
                    rowGroup: !isSetFilter,
                    hide: !isSetFilter,
                },
                { field: 'other' },
            ],
            rowData: [{ value: 'Value' }],
            groupDisplayType: 'groupRows',
            groupRowRenderer: renderer,
            enableBrowserTooltips: native,
            tooltipShowMode: mode,
        });
        let source: HTMLElement;
        if (isSetFilter) {
            vi.useRealTimers();
            api.showColumnFilter('value');
            source = await waitFor(() => {
                const item = Array.from(document.querySelectorAll<HTMLElement>('.ag-set-filter-item .ag-label')).find(
                    (element) => element.textContent === 'Formatted Value'
                );
                expect(item).toBeTruthy();
                return item!.closest<HTMLElement>('.ag-virtual-list-item')!;
            });
            vi.useFakeTimers();
        } else {
            source = grid.querySelector<HTMLElement>('.ag-full-width-row')!;
        }

        const expectTooltip = async (expected = '') => {
            await hover(source);
            if (native) {
                expect(source.getAttribute('title') ?? '').toBe(expected);
            } else {
                expect(getVisibleTooltips().map((element) => element.textContent)).toEqual(expected ? [expected] : []);
            }
            fireEvent.mouseLeave(source);
            await vi.advanceTimersByTimeAsync(1000);
        };

        await expectTooltip('Value');
        rendererParams!.setTooltip(rendererParams!.valueFormatted!);
        await expectTooltip(mode === 'standard' || mode === 'whenTruncated' ? 'Formatted Value' : '');
        rendererParams!.setTooltip('Value', () => true);
        await expectTooltip('Value');
        rendererParams!.setTooltip('Value', () => false);
        await expectTooltip();
        rendererParams!.setTooltip('Additional information');
        await expectTooltip('Additional information');
        rendererParams!.setTooltip('Additional information', () => false);
        await expectTooltip();
    });

    test.each([false, true])(
        'preserves full-width renderer tooltips without a source value (native=%s)',
        async (native) => {
            const position = vi.fn(() => 'top' as const);
            const { grid } = await createGrid({
                isFullWidthRow: () => true,
                fullWidthCellRenderer: (params: ICellRendererParams) => {
                    params.setTooltip(params.data.value);
                    const element = document.createElement('span');
                    element.textContent = params.data.value;
                    return element;
                },
                tooltipPosition: position,
                enableBrowserTooltips: native,
            });
            const source = grid.querySelector<HTMLElement>('.ag-full-width-row')!;
            await hover(source);
            if (native) {
                expect(source).toHaveAttribute('title', 'Displayed value');
            } else {
                expect(getVisibleTooltips()[0]).toHaveTextContent('Displayed value');
                expect(position).toHaveBeenCalledWith(
                    expect.objectContaining({ value: 'Displayed value', location: 'fullWidthRow' })
                );
            }
        }
    );

    test.each(['header', 'group'] as const)(
        'uses the displayed %s name and refreshes native titles after renaming',
        async (kind) => {
            const definitions: ColDef[] = [{ field: 'value', headerName: 'Original column name' }];
            const { api, grid } = await createGrid({
                columnDefs: [{ headerName: 'Original group name', groupId: 'group', children: definitions }],
                enableBrowserTooltips: true,
            });
            const selector = kind === 'header' ? '.ag-header-cell[col-id="value"]' : '.ag-header-group-cell';
            const textSelector = kind === 'header' ? '.ag-header-cell-text' : '.ag-header-group-text';
            const header = grid.querySelector<HTMLElement>(selector)!;
            setTruncated(header.querySelector<HTMLElement>(textSelector)!, true);
            await hover(header);
            expect(header).toHaveAttribute('title', kind === 'header' ? 'Original column name' : 'Original group name');
            api.setGridOption('columnDefs', [
                {
                    headerName: 'Updated group name',
                    groupId: 'group',
                    children: [{ field: 'value', headerName: 'Updated column name' }],
                },
            ]);
            await vi.advanceTimersByTimeAsync(1);
            const updated = grid.querySelector<HTMLElement>(selector)!;
            setTruncated(updated.querySelector<HTMLElement>(textSelector)!, true);
            await hover(updated);
            expect(updated).toHaveAttribute('title', kind === 'header' ? 'Updated column name' : 'Updated group name');
        }
    );

    test.each([
        { native: false, keyOnly: false },
        { native: true, keyOnly: false },
        { native: false, keyOnly: true },
        { native: true, keyOnly: true },
    ])('previews missing Set Filter values (native=$native, keyOnly=$keyOnly)', async ({ native, keyOnly }) => {
        const value = keyOnly ? 'Long key never loaded' : 'B';
        const { api } = await createGrid({
            columnDefs: [
                {
                    field: 'value',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        preservePreviousValues: true,
                        showTooltips: keyOnly ? undefined : true,
                        cellRenderer: keyOnly ? () => '<span>Custom value</span>' : undefined,
                    },
                },
            ],
            rowData: [{ value: 'A' }, { value: 'B' }],
            enableBrowserTooltips: native,
        });
        vi.useRealTimers();
        await api.setColumnFilterModel('value', { values: [value] });
        api.onFilterChanged();
        api.setGridOption('rowData', [{ value: 'A' }]);
        api.showColumnFilter('value');
        const label = await waitFor(() => {
            const label = Array.from(
                document.querySelectorAll<HTMLElement>('.ag-set-filter-item-missing .ag-label')
            ).find((element) => element.textContent === value);
            expect(label).toBeTruthy();
            return label!;
        });
        vi.useFakeTimers();
        setTruncated(label, keyOnly);
        const source = label.closest<HTMLElement>('.ag-virtual-list-item')!;
        await hover(source);
        const expected = `${value}, not in current data`;
        if (native) {
            expect(source).toHaveAttribute('title', expected);
        } else {
            expect(getVisibleTooltips()[0]).toHaveTextContent(expected);
        }
    });

    test('native Set Filter previews use updated unformatted values', async () => {
        const { api } = await createGrid({
            columnDefs: [{ field: 'value', cellDataType: false, filter: 'agSetColumnFilter' }],
            rowData: [{ value: 1234567890 }],
            enableBrowserTooltips: true,
        });
        vi.useRealTimers();
        api.showColumnFilter('value');
        await api.getColumnFilterInstance('value');
        const filter = api.getColumnFilterHandler<SetFilterHandler<number>>('value')!;
        for (const value of [1234567890, 9876543210]) {
            filter.setFilterValues([value]);
            const label = await waitFor(() => {
                const label = Array.from(document.querySelectorAll<HTMLElement>('.ag-set-filter-item .ag-label')).find(
                    (element) => element.textContent === String(value)
                );
                expect(label).toBeTruthy();
                return label!;
            });
            setTruncated(label, true);
            const source = label.closest<HTMLElement>('.ag-virtual-list-item')!;
            fireEvent.mouseEnter(source);
            expect(source).toHaveAttribute('title', String(value));
            fireEvent.mouseLeave(source);
        }
    });

    test('shows structured configured content without treating it as repeated text', async () => {
        const payload = { detail: 'Structured information' };
        const init = vi.fn();
        class StructuredTooltip {
            private eGui = document.createElement('div');
            public init(params: { value: typeof payload }): void {
                init(params.value);
                this.eGui.textContent = params.value.detail;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
        }
        const { grid } = await createGrid({
            columnDefs: [{ field: 'value', tooltip: () => payload, tooltipComponent: StructuredTooltip }],
        });
        const cell = grid.querySelector<HTMLElement>('.ag-cell')!;
        setTruncated(cell, false);
        await hover(cell);
        expect(init).toHaveBeenCalledWith(payload);
        expect(getVisibleTooltips()[0]).toHaveTextContent(payload.detail);
    });

    test.each([
        { groupDisplayType: 'singleColumn', findSearchValue: undefined },
        { groupDisplayType: 'singleColumn', findSearchValue: 'Displayed' },
        { groupDisplayType: 'groupRows', findSearchValue: undefined },
        { groupDisplayType: 'groupRows', findSearchValue: 'Displayed' },
    ] as const)(
        'previews built-in group values ($groupDisplayType, find=$findSearchValue)',
        async ({ groupDisplayType, findSearchValue }) => {
            const { grid } = await createGrid({
                columnDefs: [{ field: 'value', rowGroup: true, hide: true }, { field: 'other' }],
                groupDisplayType,
                findSearchValue,
                enableBrowserTooltips: true,
            });
            const label = grid.querySelector<HTMLElement>('.ag-group-value')!;
            if (findSearchValue) {
                expect(label.querySelector('.ag-find-match')).not.toBeNull();
            }
            setTruncated(label, true);
            const source = label.closest<HTMLElement>(
                groupDisplayType === 'groupRows' ? '.ag-full-width-row' : '.ag-cell'
            )!;
            await hover(source);
            expect(source).toHaveAttribute('title', 'Displayed value');
        }
    );

    test.each<{
        name: string;
        countryTooltip?: ColDef['tooltip'];
        sportTooltip?: ColDef['tooltip'];
        expectedCountry?: string;
        expectedSport?: string;
    }>([
        { name: 'disabled group', countryTooltip: false, expectedSport: 'Long sport name' },
        {
            name: 'configured group and automatic sibling',
            countryTooltip: 'Country details',
            expectedCountry: 'Country details',
            expectedSport: 'Long sport name',
        },
        {
            name: 'automatic group and empty configured sibling',
            sportTooltip: () => undefined,
            expectedCountry: 'Long country name',
        },
    ])('preserves per-level tooltip settings in a single group column: $name', async (params) => {
        const { grid } = await createGrid({
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, tooltip: params.countryTooltip },
                { field: 'sport', rowGroup: true, hide: true, tooltip: params.sportTooltip },
                { field: 'value' },
            ],
            rowData: [{ country: 'Long country name', sport: 'Long sport name', value: 1 }],
            groupDefaultExpanded: -1,
            enableBrowserTooltips: true,
        });
        for (const [name, expected] of [
            ['Long country name', params.expectedCountry],
            ['Long sport name', params.expectedSport],
        ]) {
            const label = Array.from(grid.querySelectorAll<HTMLElement>('.ag-group-value')).find(
                (element) => element.textContent === name
            )!;
            setTruncated(label, true);
            const source = label.closest<HTMLElement>('.ag-cell')!;
            await hover(source);
            expect(source.getAttribute('title') || undefined).toBe(expected);
            fireEvent.mouseLeave(source);
        }
    });

    test.each([undefined, 'Country details'])(
        'preserves auto-group tooltip opt-outs with grouped tooltip %s',
        async (tooltip) => {
            const { grid } = await createGrid({
                columnDefs: [{ field: 'country', rowGroup: true, hide: true, tooltip }, { field: 'value' }],
                autoGroupColumnDef: { field: 'value', tooltip: false },
                rowData: [{ country: 'Long country name', value: 'Long leaf value' }],
                groupDefaultExpanded: -1,
                enableBrowserTooltips: true,
            });
            const labels = grid.querySelectorAll<HTMLElement>('.ag-group-value');
            expect(labels).toHaveLength(2);
            for (const label of labels) {
                setTruncated(label, true);
                const source = label.closest<HTMLElement>('.ag-cell')!;
                await hover(source);
                expect(source.getAttribute('title') || undefined).toBe(
                    label.textContent === 'Long country name' ? tooltip : undefined
                );
                fireEvent.mouseLeave(source);
            }
        }
    );

    test.each<{
        name: string;
        defaultTooltip?: ColDef['tooltip'];
        leafTooltip?: ColDef['tooltip'];
        expected?: string;
    }>([
        { name: 'automatic', expected: 'Long leaf value' },
        { name: 'inherited opt-out', defaultTooltip: false },
        { name: 'inherited content', defaultTooltip: 'Leaf details', expected: 'Leaf details' },
        { name: 'explicit opt-in', defaultTooltip: false, leafTooltip: true, expected: 'Long leaf value' },
        { name: 'explicit opt-out', defaultTooltip: 'Leaf details', leafTooltip: false },
    ])(
        'preserves merged auto-group leaf tooltip settings: $name',
        async ({ defaultTooltip, leafTooltip, expected }) => {
            const { grid } = await createGrid({
                defaultColDef: { tooltip: defaultTooltip },
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true, tooltip: 'Country details' },
                    { field: 'value' },
                ],
                autoGroupColumnDef: { field: 'value', tooltip: leafTooltip },
                rowData: [{ country: 'Long country name', value: 'Long leaf value' }],
                groupDefaultExpanded: -1,
                enableBrowserTooltips: true,
            });
            const labels = grid.querySelectorAll<HTMLElement>('.ag-group-value');
            expect(labels).toHaveLength(2);
            for (const label of labels) {
                setTruncated(label, true);
                const source = label.closest<HTMLElement>('.ag-cell')!;
                await hover(source);
                expect(source.getAttribute('title') || undefined).toBe(
                    label.textContent === 'Long country name' ? 'Country details' : expected
                );
                fireEvent.mouseLeave(source);
            }
        }
    );

    test.each([false, true])('previews a selected built-in group renderer (native=%s)', async (native) => {
        const { grid } = await createGrid({
            columnDefs: [{ field: 'value', cellRendererSelector: () => ({ component: 'agGroupCellRenderer' }) }],
            enableBrowserTooltips: native,
        });
        const cell = grid.querySelector<HTMLElement>('.ag-cell')!;
        const label = cell.querySelector<HTMLElement>('.ag-group-value')!;
        expect(label).toHaveTextContent('Displayed value');
        setTruncated(label, true);
        await hover(cell);
        if (native) {
            expect(cell).toHaveAttribute('title', 'Displayed value');
        } else {
            expect(getVisibleTooltips()[0]).toHaveTextContent('Displayed value');
        }
    });

    test.each([false, true])('does not infer grid ownership from custom group markup (nested=%s)', async (nested) => {
        const markup = '<span class="ag-cell-wrapper"><span class="ag-group-value">Custom text</span></span>';
        const { grid } = await createGrid({
            columnDefs: [
                {
                    field: 'value',
                    cellRenderer: () => (nested ? `<div>${markup}</div>` : markup),
                },
            ],
            enableBrowserTooltips: true,
        });
        const cell = grid.querySelector<HTMLElement>('.ag-cell')!;
        setTruncated(cell.querySelector<HTMLElement>('.ag-group-value')!, true);
        await hover(cell);
        expect(cell).toHaveAttribute('title', '');
    });

    test.each([
        { native: false, findSearchValue: undefined },
        { native: true, findSearchValue: undefined },
        { native: false, findSearchValue: 'Long' },
        { native: true, findSearchValue: 'Long' },
    ])('previews auto-group selector fallbacks (native=$native, find=$findSearchValue)', async (options) => {
        const { grid } = await createGrid({
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'value' }],
            autoGroupColumnDef: {
                field: 'value',
                tooltip: true,
                cellRendererSelector: ({ node }) => (node.group ? { component: 'agGroupCellRenderer' } : undefined),
            },
            rowData: [{ country: 'Long country name', value: 'Long leaf value' }],
            groupDefaultExpanded: -1,
            enableBrowserTooltips: options.native,
            findSearchValue: options.findSearchValue,
        });
        const cells = grid.querySelectorAll<HTMLElement>('.ag-cell[col-id="ag-Grid-AutoColumn"]');
        expect(cells).toHaveLength(2);
        for (const cell of cells) {
            const label = cell.querySelector<HTMLElement>('.ag-group-value') ?? cell;
            const text = label.textContent!;
            if (options.findSearchValue) {
                expect(label.querySelector('.ag-find-match')).toHaveTextContent('Long');
            }
            setTruncated(label, true);
            await hover(cell);
            if (options.native) {
                expect(cell).toHaveAttribute('title', text);
            } else {
                expect(getVisibleTooltips()[0]).toHaveTextContent(text);
            }
            fireEvent.mouseLeave(cell);
            await vi.advanceTimersByTimeAsync(1000);
            setTruncated(label, false);
            await hover(cell);
            if (options.native) {
                expect(cell).toHaveAttribute('title', '');
            }
            expect(getVisibleTooltips()).toHaveLength(0);
            fireEvent.mouseLeave(cell);
        }
    });

    test.each(['renderer', 'selector', 'selectorFallback'] as const)(
        'uses the effective group inner renderer for automatic previews (%s)',
        async (kind) => {
            const renderer = () => '<span>Custom content</span>';
            const { grid } = await createGrid({
                columnDefs: [
                    {
                        field: 'country',
                        rowGroup: true,
                        hide: true,
                        cellRenderer: kind === 'renderer' ? renderer : undefined,
                        cellRendererSelector:
                            kind === 'renderer'
                                ? undefined
                                : () => (kind === 'selector' ? { component: renderer } : undefined),
                    },
                    { field: 'value' },
                ],
                rowData: [{ country: 'Long country name', value: 1 }],
                enableBrowserTooltips: true,
            });
            const label = grid.querySelector<HTMLElement>('.ag-group-value')!;
            expect(label).toHaveTextContent(kind === 'selectorFallback' ? 'Long country name' : 'Custom content');
            setTruncated(label, true);
            const source = label.closest<HTMLElement>('.ag-cell')!;
            await hover(source);
            expect(source.getAttribute('title') || undefined).toBe(
                kind === 'selectorFallback' ? 'Long country name' : undefined
            );
        }
    );

    test.each([false, true])('full-width groups measure only built-in inner content (custom=%s)', async (custom) => {
        const { grid } = await createGrid({
            columnDefs: [{ field: 'value', rowGroup: true, hide: true }, { field: 'other' }],
            groupDisplayType: 'groupRows',
            groupRowRendererParams: {
                innerRendererSelector: () => (custom ? { component: () => '<span>Custom content</span>' } : undefined),
            },
            enableBrowserTooltips: true,
        });
        const label = grid.querySelector<HTMLElement>('.ag-group-value')!;
        expect(label).toHaveTextContent(custom ? 'Custom content' : 'Displayed value');
        setTruncated(label, true);
        const source = label.closest<HTMLElement>('.ag-full-width-row')!;
        await hover(source);
        expect(source.getAttribute('title') || undefined).toBe(custom ? undefined : 'Displayed value');
    });

    test.each([false, true])(
        'provides column and group label previews in the Columns Tool Panel (native=%s)',
        async (native) => {
            const { grid } = await createGrid({
                columnDefs: [
                    {
                        headerName: 'Long column group',
                        tooltipComponent: CustomTooltip,
                        tooltipComponentParams: { prefix: 'Custom' },
                        children: [{ field: 'value', headerName: 'Long column name' }],
                    },
                ],
                defaultColDef: { tooltipComponent: CustomTooltip, tooltipComponentParams: { prefix: 'Custom' } },
                sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
                enableBrowserTooltips: native,
            });
            for (const selector of [
                '.ag-column-select-column .ag-column-select-column-label',
                '.ag-column-select-column-group .ag-column-select-column-label',
            ]) {
                const label = grid.querySelector<HTMLElement>(selector)!;
                setTruncated(label, true);
                const source = label.closest<HTMLElement>('.ag-virtual-list-item')!;
                await hover(source);
                if (native) {
                    expect(source).toHaveAttribute('title', label.textContent);
                } else {
                    expect(getVisibleTooltips()[0]).toHaveTextContent(`Custom: ${label.textContent}`);
                }
                fireEvent.mouseLeave(source);
                await vi.advanceTimersByTimeAsync(1000);
            }
        }
    );

    test.each(['columns', 'chooser'])('previews built-in label renderer fallbacks in %s', async (panel) => {
        const columnLabelRendererSelector = () => undefined;
        const { api, grid } = await createGrid({
            columnDefs: [
                { headerName: 'Long group name', children: [{ field: 'value', headerName: 'Long column name' }] },
            ],
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                        toolPanelParams: { columnLabelRendererSelector },
                    },
                ],
                defaultToolPanel: panel === 'columns' ? 'columns' : undefined,
            },
            enableBrowserTooltips: true,
        });
        if (panel === 'chooser') {
            api.showColumnChooser({ columnLabelRendererSelector });
        }
        const container = panel === 'columns' ? grid : document.querySelector<HTMLElement>('.ag-dialog')!;
        for (const selector of [
            '.ag-column-select-column .ag-column-select-column-label',
            '.ag-column-select-column-group .ag-column-select-column-label',
        ]) {
            const label = container.querySelector<HTMLElement>(selector)!;
            setTruncated(label, true);
            const source = label.closest<HTMLElement>('.ag-virtual-list-item')!;
            await hover(source);
            expect(source).toHaveAttribute('title', label.textContent);
        }
    });

    test.each([
        { purpose: 'rowGroup', native: false },
        { purpose: 'rowGroup', native: true },
        { purpose: 'pivot', native: false },
        { purpose: 'pivot', native: true },
        { purpose: 'aggregation', native: false },
        { purpose: 'aggregation', native: true },
    ])('previews the actual $purpose pill label (native=$native)', async ({ purpose, native }) => {
        const { grid } = await createGrid({
            columnDefs: [
                {
                    field: 'value',
                    headerName: 'Long column name',
                    rowGroup: purpose === 'rowGroup',
                    pivot: purpose === 'pivot',
                    aggFunc: purpose === 'aggregation' ? 'sum' : undefined,
                    tooltipComponent: CustomTooltip,
                    tooltipComponentParams: { prefix: 'Pill' },
                },
                { field: 'group', rowGroup: true },
                { field: 'amount', aggFunc: 'sum' },
            ],
            rowData: [{ group: 'Group', value: 1, amount: 1 }],
            pivotMode: purpose === 'pivot',
            sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
            enableBrowserTooltips: native,
        });
        const label = grid.querySelector<HTMLElement>(
            `.ag-column-drop-${purpose.toLowerCase()} .ag-column-drop-cell-text`
        )!;
        setTruncated(label, true);
        const source = label.closest<HTMLElement>('.ag-column-drop-cell')!;
        await hover(source);
        if (native) {
            expect(source).toHaveAttribute('title', label.textContent);
        } else {
            expect(getVisibleTooltips()[0]).toHaveTextContent(`Pill: ${label.textContent}`);
        }
    });

    test.each([false, true])(
        'compares Values-pill tooltips with the displayed aggregation label (native=%s)',
        async (native) => {
            const headerTooltip = vi.fn(() => 'sum(Amount)');
            const { grid } = await createGrid({
                columnDefs: [{ field: 'amount', headerName: 'Amount', aggFunc: 'sum', headerTooltip }],
                rowData: [{ amount: 1 }],
                sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
                enableBrowserTooltips: native,
            });
            const label = grid.querySelector<HTMLElement>('.ag-column-drop-aggregation .ag-column-drop-cell-text')!;
            const source = label.closest<HTMLElement>('.ag-column-drop-cell')!;
            expect(label).toHaveTextContent('sum(Amount)');
            setTruncated(label, false);
            await hover(source);
            expect(getVisibleTooltips()).toHaveLength(0);
            if (native) {
                expect(source).toHaveAttribute('title', '');
            }

            fireEvent.mouseLeave(source);
            setTruncated(label, true);
            await hover(source);
            if (native) {
                expect(source).toHaveAttribute('title', 'sum(Amount)');
            } else {
                expect(getVisibleTooltips()[0]).toHaveTextContent('sum(Amount)');
            }
            expect(headerTooltip).toHaveBeenLastCalledWith(
                expect.objectContaining({ value: 'Amount', valueFormatted: 'sum(Amount)' })
            );
        }
    );

    test.each(['filters', 'filters-new'])('previews labels in %s', async (panel) => {
        const { api, grid } = await createGrid({
            columnDefs: [{ field: 'value', headerName: 'Long filter name', filter: 'agTextColumnFilter' }],
            sideBar: panel,
            enableFilterHandlers: true,
            enableBrowserTooltips: true,
        });
        api.openToolPanel(panel);
        if (panel === 'filters-new') {
            api.getToolPanelInstance('filters-new')!.setFilterCards(['value']);
        }
        await vi.advanceTimersByTimeAsync(1);
        const label = grid.querySelector<HTMLElement>(
            panel === 'filters' ? '.ag-group-title' : '.ag-filter-card-title'
        )!;
        const source = label.closest<HTMLElement>(
            panel === 'filters' ? '.ag-group-title-bar' : '.ag-filter-card-expand'
        )!;
        setTruncated(label, true);
        await hover(source);
        expect(source).toHaveAttribute('title', 'Long filter name');
    });

    test.each([false, true])('previews nested Filters Tool Panel column labels (native=%s)', async (native) => {
        const { api, grid } = await createGrid({
            columnDefs: [
                {
                    headerName: 'Group',
                    children: [{ field: 'value', headerName: 'Long filter column name', filter: 'agTextColumnFilter' }],
                },
            ],
            sideBar: 'filters',
            enableBrowserTooltips: native,
            tooltipTrigger: 'focus',
        });
        api.openToolPanel('filters');
        const label = grid.querySelector<HTMLElement>('.ag-filter-toolpanel-instance-header .ag-header-cell-text')!;
        setTruncated(label, true);
        const source = label.closest<HTMLElement>('.ag-filter-toolpanel-instance-header')!;
        if (native) {
            await hover(source);
            expect(source).toHaveAttribute('title', 'Long filter column name');
        } else {
            source.focus();
            await vi.advanceTimersByTimeAsync(1);
            expect(getVisibleTooltips()[0]).toHaveTextContent('Long filter column name');
            expect(source).toHaveAccessibleDescription('Long filter column name');
        }
    });

    test('previews column chooser labels', async () => {
        const { api } = await createGrid({
            columnDefs: [{ field: 'value', headerName: 'Long chooser label' }],
            enableBrowserTooltips: true,
        });
        api.showColumnChooser();
        await vi.advanceTimersByTimeAsync(1);
        const label = document.querySelector<HTMLElement>('.ag-column-select-column-label')!;
        setTruncated(label, true);
        const source = label.closest<HTMLElement>('.ag-virtual-list-item')!;
        await hover(source);
        expect(source).toHaveAttribute('title', 'Long chooser label');
    });
});
