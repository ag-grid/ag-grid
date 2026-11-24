import { getByRole, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import {
    TestGridsManager,
    getVisibleTooltips,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import { LocaleModule, PaginationModule, TextFilterModule, TooltipModule, getGridElement } from 'ag-grid-community';
import {
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MasterDetailModule,
    NewFiltersToolPanelModule,
    RowGroupingModule,
} from 'ag-grid-enterprise';

describe('Built-in action tooltips', () => {
    const grids = new TestGridsManager({ modules: [TooltipModule] });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());

    afterEach(() => {
        grids.reset();
        vi.restoreAllMocks();
    });

    test('pagination localises its hint independently of its name and leaves the labelled input without a hint', async () => {
        const api = await grids.createGridAndWait(
            'pagination-labels',
            {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 1 }, { value: 2 }],
                pagination: true,
                paginationPageSize: 1,
                paginationPageSizeSelector: false,
                enableBrowserTooltips: true,
                localeText: { nextPage: 'Next page name', tooltipNextPage: 'Next page action' },
            },
            { modules: [PaginationModule, LocaleModule] }
        );
        const grid = getGridElement(api)! as HTMLElement;
        expect(getByRole(grid, 'button', { name: 'Next page name' })).toHaveAttribute('title', 'Next page action');
        const input = getByRole(grid, 'spinbutton');
        expect(input.closest('[title]')).toBeNull();
    });

    test('column control hints describe the current action and honour suppression', async () => {
        const api = await grids.createGridAndWait(
            'column-controls',
            {
                columnDefs: [{ headerName: 'Details', children: [{ field: 'value' }] }],
                rowData: [{ value: 1 }],
                sideBar: 'columns',
                enableBrowserTooltips: true,
            },
            { modules: [ColumnsToolPanelModule] }
        );
        const grid = getGridElement(api)! as HTMLElement;
        const headerToggle = grid.querySelector<HTMLElement>('.ag-column-select-header-icon')!;
        const allCheckbox = grid.querySelector<HTMLElement>('.ag-column-select-header-checkbox')!;
        const groupToggle = grid.querySelector<HTMLElement>('.ag-column-group-icons')!;
        const columnCheckbox = grid.querySelector<HTMLElement>('.ag-column-select-column .ag-column-select-checkbox')!;
        expect(headerToggle).toHaveAttribute('title', 'Collapse all');
        expect(allCheckbox).toHaveAttribute('title', 'Hide all columns');
        expect(groupToggle).toHaveAttribute('title', 'Collapse group');
        expect(columnCheckbox).toHaveAttribute('title', 'Hide column');
        api.setColumnsVisible(['value'], false);
        await waitFor(() => expect(columnCheckbox).toHaveAttribute('title', 'Show column'));
        expect(allCheckbox).toHaveAttribute('title', 'Show all columns');
        headerToggle.click();
        await waitFor(() => expect(headerToggle).toHaveAttribute('title', 'Expand all'));
        const collapsedGroupToggle = grid.querySelector<HTMLElement>('.ag-column-group-icons')!;
        expect(collapsedGroupToggle).toHaveAttribute('title', 'Expand group');
        api.setGridOption('suppressBuiltInTooltips', true);
        expect(headerToggle).not.toHaveAttribute('title');
        expect(collapsedGroupToggle).not.toHaveAttribute('title');
        expect(allCheckbox).not.toHaveAttribute('title');
    });

    test('row group chevrons show action hints independently of fitting cell text', async () => {
        const api = await grids.createGridAndWait(
            'row-controls',
            {
                columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'value' }],
                rowData: [{ group: 'A', value: 1 }],
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
            },
            { modules: [RowGroupingModule] }
        );
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const toggle = grid.querySelector<HTMLElement>('.ag-group-contracted')!;
        await user.hover(toggle.closest<HTMLElement>('.ag-cell')!);
        await user.hover(toggle);
        await waitFor(() => expect(getVisibleTooltips()[0]).toHaveTextContent('Expand row group'));
        await user.click(toggle);
        await waitFor(() => expect(getVisibleTooltips()).toHaveLength(0));
        await user.hover(grid.querySelector<HTMLElement>('.ag-group-expanded')!);
        await waitFor(() => expect(getVisibleTooltips()[0]).toHaveTextContent('Collapse row group'));
    });

    test('master-detail chevrons do not receive row-group action hints', async () => {
        const api = await grids.createGridAndWait(
            'detail-controls',
            {
                columnDefs: [{ field: 'value', cellRenderer: 'agGroupCellRenderer' }],
                rowData: [{ value: 'One' }],
                masterDetail: true,
                isRowMaster: () => true,
                detailCellRenderer: () => document.createElement('div'),
                enableBrowserTooltips: true,
            },
            { modules: [MasterDetailModule] }
        );
        const toggle = getGridElement(api)!.querySelector('.ag-group-contracted');
        expect(toggle).not.toBeNull();
        expect(toggle).not.toHaveAttribute('title');
    });

    test.each(['filters', 'filters-new'])('filter panel controls keep their hint in sync (%s)', async (panel) => {
        const api = await grids.createGridAndWait(
            'filter-controls',
            {
                columnDefs: [{ field: 'value', filter: 'agTextColumnFilter' }],
                rowData: [{ value: 'One' }],
                sideBar: panel,
                enableFilterHandlers: true,
                enableBrowserTooltips: true,
            },
            { modules: [FiltersToolPanelModule, NewFiltersToolPanelModule, TextFilterModule] }
        );
        api.openToolPanel(panel);
        if (panel === 'filters-new') {
            api.getToolPanelInstance('filters-new')!.setFilterCards(['value']);
        }
        const grid = getGridElement(api)! as HTMLElement;
        const selector = panel === 'filters-new' ? '.ag-filter-card-expand-icon' : '.ag-group-title-bar-icon';
        await waitFor(() => expect(grid.querySelector(selector)).not.toBeNull());
        const icon = grid.querySelector<HTMLElement>(selector)!;
        const button = icon.closest<HTMLElement>('button, [role="button"]')!;
        const expanded = button.getAttribute('aria-expanded') === 'true';
        expect(icon).toHaveAttribute('title', expanded ? 'Collapse filter' : 'Expand filter');
        button.click();
        await waitFor(() => expect(icon).toHaveAttribute('title', expanded ? 'Expand filter' : 'Collapse filter'));
        if (panel === 'filters-new') {
            expect(grid.querySelector('.ag-filter-card-delete')).toHaveAttribute('title', 'Remove filter');
        }
    });

    test.each(['filters', 'filters-new'])(
        'filter titles retain their focus preview while chevrons show hover action hints (%s)',
        async (panel) => {
            const api = await grids.createGridAndWait(
                'filter-focus',
                {
                    columnDefs: [{ field: 'value', filter: 'agTextColumnFilter', headerTooltip: 'Filter description' }],
                    rowData: [{ value: 'One' }],
                    sideBar: panel,
                    enableFilterHandlers: true,
                    tooltipTrigger: 'hoverOrFocus',
                    tooltipShowDelay: 0,
                },
                { modules: [FiltersToolPanelModule, NewFiltersToolPanelModule, TextFilterModule] }
            );
            api.openToolPanel(panel);
            if (panel === 'filters-new') {
                api.getToolPanelInstance('filters-new')!.setFilterCards(['value']);
            }
            const grid = getGridElement(api)! as HTMLElement;
            const selector = panel === 'filters-new' ? '.ag-filter-card-expand' : '.ag-group-title-bar';
            await waitFor(() => expect(grid.querySelector(selector)).not.toBeNull());
            const button = grid.querySelector<HTMLElement>(selector)!;
            const expanded = button.getAttribute('aria-expanded') === 'true';
            const text = expanded ? 'Collapse filter' : 'Expand filter';
            button.focus();
            await waitFor(() =>
                expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual(['Filter description'])
            );
            expect(button).toHaveAccessibleDescription('Filter description');
            expect(button).toHaveAccessibleName(/Value/);
            const icon = button.querySelector<HTMLElement>(
                panel === 'filters-new' ? '.ag-filter-card-expand-icon' : '.ag-group-title-bar-icon:not(.ag-hidden)'
            )!;
            icon.dispatchEvent(new MouseEvent('mouseenter', { clientX: 20, clientY: 30 }));
            await waitFor(() => expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual([text]));
            expect(button).toHaveFocus();
        }
    );
});
