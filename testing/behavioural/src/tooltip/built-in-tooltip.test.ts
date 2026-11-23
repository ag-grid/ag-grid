import { getByRole, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import { AdvancedFilterHarness, TestGridsManager, canvasPolyfill, getVisibleTooltips } from 'ag-test-utils';

import type { GridOptions, IBuiltInTooltipParams, ITooltipParams, TooltipPositionParams } from 'ag-grid-community';
import {
    DragAndDropModule,
    LocaleModule,
    PaginationModule,
    PaginationPageNumbersModule,
    RowDragModule,
    RowSelectionModule,
    TextFilterModule,
    TooltipModule,
    getGridElement,
} from 'ag-grid-community';
import {
    AdvancedFilterModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    FindModule,
    IntegratedChartsModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    ToolbarModule,
} from 'ag-grid-enterprise';

describe('Built-in control tooltips', () => {
    const grids = new TestGridsManager({ modules: [TooltipModule] });
    const tooltipTexts = () => getVisibleTooltips().map((tooltip) => tooltip.textContent);

    afterEach(() => {
        grids.reset();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test.each([
        ['hover', 'pageSummary'],
        ['focus', 'pageNumbers'],
    ] as const)(
        'keyboard focus is immediate with tooltipTrigger=%s (%s), without changing ordinary tooltips',
        async (tooltipTrigger, panel) => {
            const api = await grids.createGridAndWait(
                'focus',
                {
                    columnDefs: [{ field: 'value', tooltip: 'Cell detail' }],
                    rowData: [{ value: 'One' }, { value: 'Two' }],
                    pagination: true,
                    paginationPageSize: 1,
                    paginationPageSizeSelector: false,
                    paginationPanels: [panel],
                    tooltipTrigger,
                    tooltipShowDelay: 800,
                    tooltipSwitchShowDelay: 800,
                },
                { modules: [PaginationModule, PaginationPageNumbersModule] }
            );
            const grid = getGridElement(api)! as HTMLElement;
            const next = getByRole(grid, 'button', { name: 'Next Page' });
            const cell = grid.querySelector<HTMLElement>('.ag-cell')!;
            vi.useFakeTimers();
            const user = userEvent.setup({ delay: null });

            next.focus();
            await vi.advanceTimersByTimeAsync(0);
            expect(tooltipTexts()).toEqual(['Next Page']);
            expect(next).toHaveAccessibleName('Next Page');
            expect(next).not.toHaveAttribute('aria-describedby');

            await user.keyboard('{Escape}');
            expect(tooltipTexts()).toEqual([]);
            expect(next).toHaveFocus();
            next.blur();
            if (tooltipTrigger === 'hover') {
                await user.hover(cell);
            } else {
                cell.focus();
            }
            await vi.advanceTimersByTimeAsync(799);
            expect(tooltipTexts()).toEqual([]);
            await vi.advanceTimersByTimeAsync(1);
            expect(tooltipTexts()).toEqual(['Cell detail']);
        }
    );

    test('focus immediately shows a pending hover tooltip without undoing Escape dismissal', async () => {
        const api = await grids.createGridAndWait(
            'pending-focus',
            {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'One' }, { value: 'Two' }],
                pagination: true,
                paginationPageSize: 1,
                paginationPageSizeSelector: false,
                tooltipShowDelay: 800,
            },
            { modules: [PaginationModule] }
        );
        const next = getByRole(getGridElement(api)! as HTMLElement, 'button', { name: 'Next Page' });
        vi.useFakeTimers();
        const user = userEvent.setup({ delay: null });

        await user.hover(next);
        await vi.advanceTimersByTimeAsync(100);
        expect(tooltipTexts()).toEqual([]);
        next.focus();
        await vi.advanceTimersByTimeAsync(0);
        expect(tooltipTexts()).toEqual(['Next Page']);

        await user.keyboard('{Escape}');
        await vi.advanceTimersByTimeAsync(800);
        expect(tooltipTexts()).toEqual([]);
        expect(next).toHaveFocus();
    });

    test('an unsorted indicator does not replace its containing header tooltip', async () => {
        const api = await grids.createGridAndWait('unsorted', {
            columnDefs: [{ field: 'value', headerTooltip: 'Column description', unSortIcon: true }],
            rowData: [{ value: 'One' }],
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        });
        const grid = getGridElement(api)!;
        const label = grid.querySelector<HTMLElement>('.ag-header-cell-text')!;
        const icon = grid.querySelector<HTMLElement>('.ag-sort-none-icon')!;
        vi.useFakeTimers();
        const user = userEvent.setup({ delay: null });

        await user.hover(label);
        await vi.advanceTimersByTimeAsync(0);
        const tooltip = getVisibleTooltips()[0];
        expect(tooltip).toHaveTextContent('Column description');

        await user.hover(icon);
        await vi.advanceTimersByTimeAsync(100);
        expect(getVisibleTooltips()).toEqual([tooltip]);
        await user.hover(label);
        await vi.advanceTimersByTimeAsync(100);
        expect(getVisibleTooltips()).toEqual([tooltip]);
    });

    test('hover keeps show and switch delays, and runtime suppression cancels visible and pending tooltips', async () => {
        const api = await grids.createGridAndWait(
            'hover',
            {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'One' }, { value: 'Two' }, { value: 'Three' }],
                pagination: true,
                paginationPageSize: 1,
                paginationPageSizeSelector: false,
                tooltipTrigger: 'focus',
                tooltipShowDelay: 400,
                tooltipSwitchShowDelay: 120,
            },
            { modules: [PaginationModule] }
        );
        const grid = getGridElement(api)! as HTMLElement;
        const next = getByRole(grid, 'button', { name: 'Next Page' });
        const last = getByRole(grid, 'button', { name: 'Last Page' });
        vi.useFakeTimers();
        const user = userEvent.setup({ delay: null });

        await user.hover(next);
        await vi.advanceTimersByTimeAsync(399);
        expect(tooltipTexts()).toEqual([]);
        await vi.advanceTimersByTimeAsync(1);
        expect(tooltipTexts()).toEqual(['Next Page']);
        await user.unhover(next);
        await vi.advanceTimersByTimeAsync(100);
        await user.hover(last);
        await vi.advanceTimersByTimeAsync(119);
        expect(tooltipTexts()).toEqual([]);
        await vi.advanceTimersByTimeAsync(1);
        expect(tooltipTexts()).toEqual(['Last Page']);

        api.setGridOption('suppressBuiltInTooltips', true);
        expect(tooltipTexts()).toEqual([]);
        await user.unhover(last);
        api.setGridOption('suppressBuiltInTooltips', false);
        await user.hover(next);
        api.setGridOption('suppressBuiltInTooltips', true);
        await vi.advanceTimersByTimeAsync(800);
        expect(tooltipTexts()).toEqual([]);

        api.setGridOption('suppressBuiltInTooltips', false);
        next.focus();
        await vi.advanceTimersByTimeAsync(0);
        expect(tooltipTexts()).toEqual(['Next Page']);
    });

    test('native titles follow suppression without suppressing an ordinary cell title', async () => {
        const api = await grids.createGridAndWait(
            'native',
            {
                columnDefs: [{ field: 'value', tooltip: 'Cell detail' }],
                rowData: [{ value: 'One' }, { value: 'Two' }],
                pagination: true,
                paginationPageSize: 1,
                paginationPageSizeSelector: false,
                enableBrowserTooltips: true,
            },
            { modules: [PaginationModule] }
        );
        const grid = getGridElement(api)! as HTMLElement;
        const next = getByRole(grid, 'button', { name: 'Next Page' });
        const cell = grid.querySelector('.ag-cell')!;
        expect(next).toHaveAttribute('title', 'Next Page');
        expect(cell).toHaveAttribute('title', 'Cell detail');

        vi.useFakeTimers();
        await userEvent.setup({ delay: null }).hover(next);
        next.focus();
        await vi.advanceTimersByTimeAsync(2000);
        expect(tooltipTexts()).toEqual([]);
        api.setGridOption('suppressBuiltInTooltips', true);
        expect(next).not.toHaveAttribute('title');
        expect(cell).toHaveAttribute('title', 'Cell detail');
        api.setGridOption('suppressBuiltInTooltips', false);
        expect(next).toHaveAttribute('title', 'Next Page');
    });

    test('header, filter, sort, resize, selection and drag sources carry their own context and current state', async () => {
        const position = vi.fn<(params: TooltipPositionParams) => undefined>(() => undefined);
        const api = await grids.createGridAndWait(
            'sources',
            {
                columnDefs: [{ field: 'value', filter: true, sort: 'asc', rowDrag: true }],
                rowData: [{ value: 'One' }],
                rowSelection: { mode: 'multiRow' },
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
                tooltipPosition: position,
            },
            { modules: [ColumnMenuModule, TextFilterModule, RowSelectionModule, RowDragModule] }
        );
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const sources = [
            ['.ag-header-cell[col-id="value"] .ag-header-cell-menu-button', 'columnMenu', 'Column Menu', 'header'],
            ['.ag-header-cell[col-id="value"] .ag-header-cell-filter-button', 'filter', 'Filter', 'header'],
            ['.ag-header-cell[col-id="value"] .ag-sort-ascending-icon', 'sort', 'Sorted ascending', 'header'],
            ['.ag-header-cell[col-id="value"] .ag-header-cell-resize', 'resizeColumn', 'Resize column', 'header'],
            ['.ag-header-select-all', 'selectAll', 'Select all rows', 'header'],
            ['.ag-selection-checkbox', 'selectRow', 'Select row', 'cell'],
            ['.ag-row-drag', 'rowDrag', 'Drag to move', 'cell'],
        ] as const;
        for (const [selector, control, text, location] of sources) {
            const source = grid.querySelector<HTMLElement>(selector)!;
            expect(source).not.toBeNull();
            // user-event enters descendants before ancestors; enter the containing cell first, as a browser does.
            await user.hover(source.closest<HTMLElement>('.ag-header-cell, .ag-cell')!);
            await user.hover(source);
            await waitFor(() => expect(tooltipTexts()).toEqual([text]));
            expect(position).toHaveBeenLastCalledWith(expect.objectContaining({ control, location, value: text }));
            if (control === 'rowDrag') {
                expect(position).toHaveBeenLastCalledWith(
                    expect.objectContaining({ column: api.getColumn('value'), node: api.getDisplayedRowAtIndex(0) })
                );
            }
            await user.unhover(source);
            await waitFor(() => expect(tooltipTexts()).toEqual([]));
        }

        api.getDisplayedRowAtIndex(0)!.setSelected(true);
        const checkbox = grid.querySelector<HTMLElement>('.ag-selection-checkbox')!;
        await user.hover(checkbox.closest<HTMLElement>('.ag-cell')!);
        await user.hover(checkbox);
        await waitFor(() => expect(tooltipTexts()).toEqual(['Deselect row']));
        await user.unhover(checkbox);
        await waitFor(() => expect(tooltipTexts()).toEqual([]));
        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });
        const descending = grid.querySelector<HTMLElement>('.ag-header-cell[col-id="value"] .ag-sort-descending-icon')!;
        await user.hover(descending.closest<HTMLElement>('.ag-header-cell')!);
        await user.hover(descending);
        await waitFor(() => expect(tooltipTexts()).toEqual(['Sorted descending']));
    });

    test('native dndSource handles show the row-drag hint with their row context', async () => {
        const position = vi.fn<(params: TooltipPositionParams) => undefined>(() => undefined);
        const rowData = [{ value: 'One' }];
        const api = await grids.createGridAndWait(
            'native-drag-source',
            {
                columnDefs: [{ field: 'value', dndSource: true }],
                rowData,
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
                tooltipPosition: position,
            },
            { modules: [DragAndDropModule] }
        );
        const grid = getGridElement(api)! as HTMLElement;
        const handle = grid.querySelector<HTMLElement>('.ag-row-drag[draggable="true"]')!;
        expect(handle).not.toBeNull();
        const user = userEvent.setup();
        await user.hover(handle.closest<HTMLElement>('.ag-cell')!);
        await user.hover(handle);
        await waitFor(() => expect(tooltipTexts()).toEqual(['Drag to move']));
        expect(position).toHaveBeenLastCalledWith(
            expect.objectContaining({
                control: 'rowDrag',
                location: 'cell',
                value: 'Drag to move',
                column: api.getColumn('value'),
                node: api.getDisplayedRowAtIndex(0),
                data: rowData[0],
            })
        );

        api.setGridOption('rowData', []);
        await waitFor(() => expect(handle).not.toBeInTheDocument());
        await waitFor(() => expect(tooltipTexts()).toEqual([]));
    });

    test('custom built-in tooltips do not inherit the column component or its params', async () => {
        const builtInInit = vi.fn();
        const columnInit = vi.fn();
        class BuiltInTooltip {
            private readonly gui = document.createElement('div');
            init(params: IBuiltInTooltipParams & { prefix: string }): void {
                builtInInit(params);
                this.gui.className = 'ag-tooltip-custom';
                this.gui.textContent = params.prefix + params.text;
            }
            getGui(): HTMLElement {
                return this.gui;
            }
        }
        class ColumnTooltip {
            private readonly gui = document.createElement('div');
            init(params: ITooltipParams): void {
                columnInit(params);
                this.gui.className = 'ag-tooltip-custom';
                this.gui.textContent = String(params.value);
            }
            getGui(): HTMLElement {
                return this.gui;
            }
        }
        const api = await grids.createGridAndWait(
            'custom',
            {
                columnDefs: [
                    {
                        field: 'value',
                        tooltip: 'Cell detail',
                        headerTooltip: false,
                        tooltipComponent: ColumnTooltip,
                        tooltipComponentParams: { columnOnly: true },
                    },
                ],
                rowData: [{ value: 'One' }],
                builtInTooltipComponent: BuiltInTooltip,
                builtInTooltipComponentParams: { prefix: 'Hint: ' },
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
            },
            { modules: [ColumnMenuModule] }
        );
        const grid = getGridElement(api)! as HTMLElement;
        const menu = grid.querySelector<HTMLElement>('.ag-header-cell-menu-button')!;
        const user = userEvent.setup();
        await user.hover(menu.closest<HTMLElement>('.ag-header-cell')!);
        await user.hover(menu);
        await waitFor(() => expect(tooltipTexts()).toEqual(['Hint: Column Menu']));
        const params = builtInInit.mock.lastCall![0] as IBuiltInTooltipParams;
        expect(params).toMatchObject({
            text: 'Column Menu',
            control: 'columnMenu',
            location: 'header',
            column: api.getColumn('value'),
            api,
        });
        expect(params).not.toHaveProperty('columnOnly');
        expect(columnInit).not.toHaveBeenCalled();
        params.hideTooltipCallback();
        expect(tooltipTexts()).toEqual([]);

        await user.unhover(menu);
        await user.hover(grid.querySelector<HTMLElement>('.ag-cell')!);
        await waitFor(() => expect(tooltipTexts()).toEqual(['Cell detail']));
        expect(columnInit).toHaveBeenLastCalledWith(expect.objectContaining({ columnOnly: true, location: 'cell' }));
        expect(columnInit.mock.lastCall![0].control).toBeUndefined();
    });

    test.each(['shorthand', 'full definitions'])(
        'side bar %s use the built-in descriptions rather than their labels',
        async (definition) => {
            const sideBar: GridOptions['sideBar'] =
                definition === 'shorthand'
                    ? ['columns', 'filters']
                    : {
                          toolPanels: [
                              {
                                  id: 'columns',
                                  labelDefault: 'Columns',
                                  labelKey: 'columns',
                                  iconKey: 'columns',
                                  toolPanel: 'agColumnsToolPanel',
                              },
                              {
                                  id: 'filters',
                                  labelDefault: 'Filters',
                                  labelKey: 'filters',
                                  iconKey: 'filter',
                                  toolPanel: 'agFiltersToolPanel',
                              },
                          ],
                      };
            const api = await grids.createGridAndWait(
                'sidebar',
                {
                    columnDefs: [{ field: 'value' }],
                    rowData: [{ value: 'One' }],
                    sideBar,
                    tooltipShowDelay: 0,
                    tooltipSwitchShowDelay: 0,
                },
                { modules: [ColumnsToolPanelModule, FiltersToolPanelModule] }
            );
            const grid = getGridElement(api)! as HTMLElement;
            for (const [name, text] of [
                ['Columns', 'Configure columns'],
                ['Filters', 'Configure filters'],
            ]) {
                const button = getByRole(grid, 'tab', { name });
                button.focus();
                await waitFor(() => expect(tooltipTexts()).toEqual([text]));
                expect(button).toHaveAccessibleDescription(text);
                button.blur();
                await waitFor(() => expect(tooltipTexts()).toEqual([]));
            }
        }
    );

    test('custom side bar tooltip keys fall back to tooltipDefault, never labelDefault', async () => {
        class Panel {
            private readonly gui = document.createElement('div');
            getGui(): HTMLElement {
                return this.gui;
            }
        }
        const api = await grids.createGridAndWait(
            'custom-sidebar',
            {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 'One' }],
                sideBar: {
                    toolPanels: [
                        {
                            id: 'localised',
                            labelDefault: 'Localised',
                            labelKey: 'localisedLabel',
                            iconKey: 'columns',
                            toolPanel: Panel,
                            tooltipKey: 'customHint',
                            tooltipDefault: 'Fallback',
                        },
                        {
                            id: 'fallback',
                            labelDefault: 'Fallback',
                            labelKey: 'fallbackLabel',
                            iconKey: 'columns',
                            toolPanel: Panel,
                            tooltipKey: 'missingHint',
                            tooltipDefault: 'Fallback hint',
                        },
                        {
                            id: 'none',
                            labelDefault: 'No tooltip',
                            labelKey: 'noneLabel',
                            iconKey: 'columns',
                            toolPanel: Panel,
                            tooltipKey: 'missingWithoutDefault',
                        },
                    ],
                },
                localeText: { customHint: 'Localised hint' },
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
            },
            { modules: [ColumnsToolPanelModule, LocaleModule] }
        );
        const grid = getGridElement(api)! as HTMLElement;
        vi.useFakeTimers();
        for (const [name, text] of [
            ['Localised', 'Localised hint'],
            ['Fallback', 'Fallback hint'],
            ['No tooltip', undefined],
        ]) {
            const button = getByRole(grid, 'tab', { name });
            button.focus();
            await vi.advanceTimersByTimeAsync(0);
            expect(tooltipTexts()).toEqual(text ? [text] : []);
            button.blur();
            await vi.advanceTimersByTimeAsync(100);
        }
    });

    test('a draggable column group has a drag hint when all its columns have locked visibility', async () => {
        const api = await grids.createGridAndWait(
            'locked-visibility',
            {
                columnDefs: [
                    {
                        headerName: 'Locked',
                        children: [
                            { field: 'a', lockVisible: true },
                            { field: 'b', lockVisible: true },
                        ],
                    },
                    { field: 'c' },
                ],
                rowData: [{ a: 1, b: 2, c: 3 }],
                sideBar: 'columns',
                tooltipShowDelay: 0,
            },
            { modules: [ColumnsToolPanelModule] }
        );
        const group = getGridElement(api)!.querySelector<HTMLElement>('.ag-column-select-column-group')!;
        expect(group).toHaveClass('ag-column-select-column-group-readonly');
        const handle = group.querySelector<HTMLElement>('.ag-column-select-column-group-drag-handle')!;
        expect(handle).toBeVisible();
        const user = userEvent.setup();
        await user.hover(group);
        await user.hover(handle);
        await waitFor(() => expect(tooltipTexts()).toEqual(['Drag to move']));
    });

    test('pivot, pill, dialog and quick-access toolbar controls register built-in tooltips', async () => {
        const position = vi.fn<(params: TooltipPositionParams) => undefined>(() => undefined);
        const api = await grids.createGridAndWait(
            'enterprise-sources',
            {
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true, sort: 'asc' },
                    { field: 'value', enableValue: true },
                ],
                rowData: [
                    { group: 'A', value: 'One' },
                    { group: 'A', value: 'Only' },
                ],
                groupDefaultExpanded: -1,
                sideBar: 'columns',
                rowGroupPanelShow: 'always',
                toolbar: {
                    items: [
                        { key: 'refresh', label: 'Refresh', action: () => {} },
                        {
                            toolbarItem: 'agMenuToolbarItem',
                            label: 'Actions',
                            toolbarItemParams: { menuItems: [{ name: 'Action', action: () => {} }] },
                        },
                        'agFindToolbarItem',
                    ],
                },
                findSearchValue: 'On',
                tooltipPosition: position,
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
            },
            {
                modules: [
                    ColumnsToolPanelModule,
                    ColumnMenuModule,
                    RowGroupingModule,
                    RowGroupingPanelModule,
                    PivotModule,
                    ToolbarModule,
                    FindModule,
                ],
            }
        );
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const sources: [HTMLElement, string][] = [
            [grid.querySelector<HTMLElement>('.ag-pivot-mode-select')!, 'Turn on pivot mode'],
            [grid.querySelector<HTMLElement>('.ag-column-drop-cell-drag-handle')!, 'Drag to move'],
            [grid.querySelector<HTMLElement>('.ag-column-drop-cell-button')!, 'Remove'],
            [getByRole(grid, 'button', { name: 'Refresh' }), 'Refresh'],
            [getByRole(grid, 'button', { name: 'Actions' }), 'Actions'],
            [getByRole(grid, 'button', { name: 'Next Match' }), 'Next Match'],
            [getByRole(grid.querySelector<HTMLElement>('.ag-toolbar-find')!, 'button', { name: 'Clear' }), 'Clear'],
        ];
        for (const [source, text] of sources) {
            expect(source).not.toBeNull();
            await user.hover(source.closest<HTMLElement>('.ag-column-drop-cell') ?? source.parentElement!);
            await user.hover(source);
            await waitFor(() => expect(tooltipTexts()).toEqual([text]));
            await user.unhover(source);
            await waitFor(() => expect(tooltipTexts()).toEqual([]));
        }

        const pill = grid.querySelector<HTMLElement>('.ag-column-drop-horizontal .ag-column-drop-cell')!;
        const sortIcon = pill.querySelector<HTMLElement>('.ag-sort-ascending-icon')!;
        await user.hover(pill);
        await user.hover(sortIcon);
        await waitFor(() => expect(tooltipTexts()).toEqual(['Sorted ascending']));
        expect(position).toHaveBeenLastCalledWith(
            expect.objectContaining({
                control: 'sort',
                location: 'rowGroupColumnsList',
                column: api.getColumn('group'),
            })
        );
        await user.unhover(sortIcon);
        await waitFor(() => expect(tooltipTexts()).toEqual([]));

        const refresh = getByRole(grid, 'button', { name: 'Refresh' });
        expect(refresh).not.toHaveAttribute('title');
        api.getToolbarItemInstance('refresh')!.refresh!({
            api,
            context: api.getGridOption('context'),
            key: 'refresh',
            label: 'Reload',
            tooltip: 'Reload data',
        });
        expect(refresh).toHaveAccessibleName('Reload data');
        expect(refresh).not.toHaveAttribute('title');
        await user.hover(refresh);
        await waitFor(() => expect(tooltipTexts()).toEqual(['Reload data']));
        await user.unhover(refresh);
        await waitFor(() => expect(tooltipTexts()).toEqual([]));

        api.setGridOption('pivotMode', true);
        const pivot = grid.querySelector<HTMLInputElement>('.ag-pivot-mode-select input')!;
        await waitFor(() => expect(pivot).toBeChecked());
        pivot.focus();
        await waitFor(() => expect(tooltipTexts()).toEqual(['Turn off pivot mode']));
        expect(pivot).toHaveFocus();
        expect(pivot).toHaveAttribute('aria-describedby');
        expect(pivot).toHaveAccessibleDescription('Turn off pivot mode');
        pivot.blur();
        await waitFor(() => expect(tooltipTexts()).toEqual([]));

        api.showColumnChooser();
        const close = await waitFor(() => getByRole(document.body, 'button', { name: /^Close$/ }));
        close.focus();
        await waitFor(() => expect(tooltipTexts()).toEqual(['Close']));
        expect(close).not.toHaveAttribute('aria-describedby');
    });

    test('group expansion dismisses the old action tooltip and exposes the new action', async () => {
        const api = await grids.createGridAndWait('group-expansion', {
            columnDefs: [
                {
                    groupId: 'details',
                    headerName: 'Details',
                    children: [{ field: 'name' }, { field: 'value', columnGroupShow: 'open' }],
                },
            ],
            rowData: [{ name: 'One', value: 1 }],
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        });
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        for (const [state, text, expanded] of [
            ['collapsed', 'Expand group', true],
            ['expanded', 'Collapse group', false],
        ] as const) {
            const group = grid.querySelector<HTMLElement>('.ag-header-group-cell')!;
            const toggle = group.querySelector<HTMLElement>(`.ag-header-expand-icon-${state}`)!;
            await user.hover(group);
            await user.hover(toggle);
            await waitFor(() => expect(tooltipTexts()).toEqual([text]));
            await user.click(toggle);
            await waitFor(() => expect(api.getColumnGroup('details')!.isExpanded()).toBe(expanded));
            await waitFor(() => expect(tooltipTexts()).toEqual([]));
            await user.unhover(toggle);
        }
    });

    describe('maximisable chart dialog', () => {
        beforeAll(async () => {
            await canvasPolyfill.init();
        });
        afterAll(() => canvasPolyfill.reset());

        test('maximise and restore dismiss the old tooltip and update the focused button hint', async () => {
            const api = await grids.createGridAndWait(
                'chart-dialog',
                {
                    columnDefs: [
                        { field: 'name', chartDataType: 'category' },
                        { field: 'value', chartDataType: 'series' },
                    ],
                    rowData: [{ name: 'One', value: 1 }],
                    popupParent: document.body,
                    tooltipShowDelay: 0,
                },
                { modules: [IntegratedChartsModule.with(AgChartsEnterpriseModule)] }
            );
            const chart = api.createRangeChart({
                cellRange: { columns: ['name', 'value'] },
                chartType: 'groupedColumn',
            })!;
            await chart.chart.waitForUpdate();
            const toggle = getByRole(document.body, 'button', { name: 'Maximize' });
            for (const [text, nextAction] of [
                ['Maximize', 'Restore'],
                ['Restore', 'Maximize'],
            ]) {
                toggle.focus();
                await waitFor(() => expect(tooltipTexts()).toEqual([text]));
                expect(toggle).not.toHaveAttribute('aria-describedby');
                toggle.click();
                expect(toggle).toHaveAccessibleName(nextAction);
                await waitFor(() => expect(tooltipTexts()).toEqual([]));
                toggle.blur();
            }
            await chart.chart.waitForUpdate();
        });
    });

    test('suppression leaves Advanced Filter validation and its show delay unchanged', async () => {
        const api = await grids.createGridAndWait(
            'validation',
            {
                columnDefs: [{ field: 'value', filter: true }],
                rowData: [{ value: 'One' }],
                enableAdvancedFilter: true,
                suppressBuiltInTooltips: true,
                tooltipTrigger: 'focus',
                tooltipShowDelay: 0,
            },
            { modules: [AdvancedFilterModule, TextFilterModule] }
        );
        const filter = AdvancedFilterHarness.get(api);
        await filter.type('[Missing] equals "value"');
        vi.useFakeTimers();
        filter.input.focus();
        expect(getGridElement(api)!.querySelector('.ag-advanced-filter')).toHaveAccessibleDescription(
            /Column not found/
        );
        await vi.advanceTimersByTimeAsync(999);
        expect(tooltipTexts()).toEqual([]);
        await vi.advanceTimersByTimeAsync(1);
        expect(getVisibleTooltips()[0]).toHaveTextContent('Column not found');
    });
});
