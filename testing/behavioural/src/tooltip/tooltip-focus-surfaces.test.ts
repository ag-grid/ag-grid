import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import {
    AdvancedFilterHarness,
    ColumnFilterHarness,
    TestGridsManager,
    fakeElementAttribute,
    getVisibleTooltips,
    polyfillOffsetParent,
} from 'ag-test-utils';

import { getGridElement, setupAgTestIds } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('Tooltip focus surfaces', () => {
    const grids = new TestGridsManager({ modules: [AllEnterpriseModule] });
    let restoreOffsetParent: (() => void) | undefined;

    beforeAll(() => setupAgTestIds());

    beforeEach(() => {
        fakeElementAttribute('offsetHeight', 300, '.ag-virtual-list-viewport');
        restoreOffsetParent = polyfillOffsetParent();
    });

    afterEach(() => {
        grids.reset();
        restoreOffsetParent?.();
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    test.each(['focus', 'hoverOrFocus'] as const)(
        'preserves the Advanced Filter show-delay override in %s mode',
        async (tooltipTrigger) => {
            const api = await grids.createGridAndWait('advanced-filter-tooltip-delay', {
                columnDefs: [{ field: 'value', filter: true }],
                rowData: [{ value: 7 }],
                enableAdvancedFilter: true,
                tooltipTrigger,
                tooltipShowDelay: 0,
            });
            const filter = AdvancedFilterHarness.get(api);
            await filter.type('[Missing] equals "value"');

            vi.useFakeTimers();
            filter.input.focus();
            expect(filter.input).toHaveFocus();
            expect(getGridElement(api)!.querySelector('.ag-advanced-filter')).toHaveAccessibleDescription(
                /Column not found/
            );
            await vi.advanceTimersByTimeAsync(999);
            expect(getVisibleTooltips()).toHaveLength(0);
            await vi.advanceTimersByTimeAsync(1);
            expect(getVisibleTooltips()).toHaveLength(1);
            expect(getVisibleTooltips()[0]).toHaveTextContent('Column not found');
        }
    );

    test('headers and Columns Tool Panel items expose their descriptions before the visual delay', async () => {
        const api = await grids.createGridAndWait('focus-surfaces', {
            columnDefs: [
                {
                    headerName: 'Group',
                    headerTooltip: 'Group description',
                    children: [{ field: 'value', headerTooltip: 'Column description' }],
                },
            ],
            rowData: [{ value: 'First' }],
            sideBar: 'columns',
            tooltipTrigger: 'hoverOrFocus',
            tooltipShowDelay: 200,
        });
        const grid = getGridElement(api)!;
        await waitFor(() => expect(grid.querySelectorAll('.ag-column-select-column')).toHaveLength(1));
        vi.useFakeTimers();
        const sources: [HTMLElement, string][] = [
            [grid.querySelector<HTMLElement>('.ag-header-group-cell')!, 'Group description'],
            [grid.querySelector<HTMLElement>('.ag-header-cell')!, 'Column description'],
            [
                grid.querySelector('.ag-column-select-column-group')!.closest<HTMLElement>('[role="treeitem"]')!,
                'Group description',
            ],
            [
                grid.querySelector('.ag-column-select-column')!.closest<HTMLElement>('[role="treeitem"]')!,
                'Column description',
            ],
        ];
        for (const [source, description] of sources) {
            source.focus();
            expect(source).toHaveFocus();
            expect(source).toHaveAccessibleDescription(new RegExp(description));
            expect(getVisibleTooltips()).toHaveLength(0);
            await vi.advanceTimersByTimeAsync(200);
            expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual([description]);
            source.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        }
    });

    test('set filter items expose their description on keyboard focus', async () => {
        const api = await grids.createGridAndWait('set-filter-tooltips', {
            columnDefs: [{ field: 'value', filter: 'agSetColumnFilter', filterParams: { showTooltips: true } }],
            rowData: [{ value: 'First' }],
            tooltipTrigger: 'hoverOrFocus',
            tooltipShowDelay: 200,
        });
        await ColumnFilterHarness.open(api, 'value');
        const item = Array.from(document.querySelectorAll<HTMLElement>('.ag-set-filter-item')).find(
            (element) => element.textContent?.trim() === 'First'
        )!;
        const source = item.closest<HTMLElement>('[tabindex]')!;
        vi.useFakeTimers();
        source.focus();
        expect(source).toHaveAccessibleDescription('First');
        expect(getVisibleTooltips()).toHaveLength(0);
        await vi.advanceTimersByTimeAsync(200);
        expect(getVisibleTooltips()[0]).toHaveTextContent('First');
    });

    test.each([undefined, null, ''])(
        'a suggestion selected before mounting respects the tooltip description (%s)',
        async (description) => {
            const label = 'Revenue with a long label';
            const selector = 'body .ag-calculated-column-suggestion-label';
            fakeElementAttribute('scrollWidth', 200, selector);
            fakeElementAttribute('clientWidth', 100, selector);
            const api = await grids.createGridAndWait('calculated-column-tooltips', {
                calculatedColumns: { applyMode: 'deferred' },
                columnDefs: [{ field: 'revenue', headerName: label }],
                rowData: [{ revenue: 10 }],
                tooltipTrigger: 'hoverOrFocus',
                tooltipShowDelay: 0,
                getTooltipAriaDescription: () => description,
            });
            api.openAddCalculatedColumnDialog();
            const input = document.querySelector<HTMLTextAreaElement>('.ag-calculated-column-form textarea')!;
            await userEvent.type(input, '[[');
            await waitFor(() => expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual([label]));

            const option = document.getElementById(input.getAttribute('aria-activedescendant')!)!;
            expect(option).toHaveAttribute('role', 'option');
            expect(option).toHaveAccessibleDescription(description === undefined ? label : '');
            expect(option.hasAttribute('aria-describedby')).toBe(description === undefined);
        }
    );

    test('Rich Select describes the active option, not its presentational child', async () => {
        fakeElementAttribute('scrollWidth', 200, '.ag-rich-select-row span');
        fakeElementAttribute('clientWidth', 100, '.ag-rich-select-row span');
        const api = await grids.createGridAndWait('rich-select-tooltips', {
            columnDefs: [
                {
                    field: 'value',
                    editable: true,
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: { values: ['First', 'Second'] },
                },
            ],
            rowData: [{ value: 'First' }],
            tooltipTrigger: 'hoverOrFocus',
            tooltipShowDelay: 0,
        });
        api.setFocusedCell(0, 'value');
        api.startEditingCell({ rowIndex: 0, colKey: 'value', key: 'Enter' });
        await waitFor(() => expect(document.querySelectorAll('.ag-rich-select-row')).toHaveLength(2));
        await userEvent.keyboard('{ArrowDown}');
        const combobox = document.activeElement!;
        const active = document.getElementById(combobox.getAttribute('aria-activedescendant')!)!;
        expect(active).toHaveAttribute('role', 'option');
        expect(active).toHaveAccessibleDescription('Second');
        expect(active.querySelector('.ag-rich-select-row')).not.toHaveAttribute('aria-describedby');
    });
});
