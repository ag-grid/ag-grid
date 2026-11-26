import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { ALL_SEVERITIES, LEGACY_FILTER_WARNING_IDS, TestGridsManager, getVisibleTooltips } from 'ag-test-utils';

import type { FilterHandler, Module, NumberFilterModel, ValueFormatterParams } from 'ag-grid-community';
import {
    CustomFilterModule,
    DateFilterModule,
    NumberFilterModule,
    RenderApiModule,
    TextFilterModule,
    TooltipModule,
    enableDevValidations,
    getGridElement,
} from 'ag-grid-community';
import { GroupFilterModule, RowGroupingModule, SetFilterModule } from 'ag-grid-enterprise';

class InteractiveTooltip {
    private readonly eGui = document.createElement('div');

    public init({ text }: { text: string }): void {
        this.eGui.textContent = text;
        const button = document.createElement('button');
        button.setAttribute('aria-label', 'Tooltip action');
        this.eGui.appendChild(button);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}

describe.each([false, true])('Built-in floating filter tooltips (enableFilterHandlers=%s)', (enableFilterHandlers) => {
    const grids = new TestGridsManager({ modules: [TooltipModule] });
    const tooltipTexts = () => getVisibleTooltips().map((tooltip) => tooltip.textContent);

    beforeEach(() => {
        if (!enableFilterHandlers) {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: LEGACY_FILTER_WARNING_IDS });
        }
    });

    afterEach(() => {
        grids.reset();
        vi.restoreAllMocks();
    });

    test.each<[boolean, string | undefined]>([
        [false, undefined],
        [true, undefined],
        [false, 'set'],
        [true, 'set'],
    ])('reuses custom group summaries (browser=%s, type=%s)', async (enableBrowserTooltips, filterType) => {
        const getModelAsString = vi.fn((model: string | null, source?: 'floating' | 'filterToolPanel') => {
            const summaries = { floating: model ?? '', filterToolPanel: `Summary: ${model}` };
            return summaries[source ?? 'floating'];
        });
        class CustomFilter {
            public readonly filterType = filterType;
            private model: string | null = null;
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass(): boolean {
                return true;
            }
            public getModel(): string | null {
                return this.model;
            }
            public setModel(model: string | null): void {
                this.model = model;
            }
            public getModelAsString = getModelAsString;
        }
        const api = await grids.createGridAndWait(
            'custom-group',
            {
                columnDefs: [
                    {
                        field: 'country',
                        rowGroup: true,
                        hide: true,
                        filter: enableFilterHandlers
                            ? {
                                  component: CustomFilter,
                                  handler: () => ({ filterType, doesFilterPass: () => true, getModelAsString }),
                              }
                            : CustomFilter,
                    },
                ],
                autoGroupColumnDef: { filter: 'agGroupColumnFilter', floatingFilter: true },
                rowData: [{ country: 'Ireland' }],
                enableFilterHandlers,
                enableBrowserTooltips,
                tooltipShowDelay: 0,
            },
            { modules: [CustomFilterModule, GroupFilterModule, RowGroupingModule, SetFilterModule] }
        );
        const summary = 'A long custom group filter summary';
        await api.setColumnFilterModel('country', summary);
        api.onFilterChanged();
        const input = getGridElement(api)!.querySelector<HTMLInputElement>('.ag-group-floating-filter input')!;
        await waitFor(() => expect(input.value).toBe(summary));
        vi.spyOn(input, 'scrollWidth', 'get').mockReturnValue(2000);
        vi.spyOn(input, 'clientWidth', 'get').mockReturnValue(100);
        const source = input.closest<HTMLElement>('.ag-input-field')!;
        getModelAsString.mockClear();

        const header = source.closest<HTMLElement>('.ag-floating-filter')!;
        if (enableBrowserTooltips) {
            await userEvent.setup().hover(source);
        } else {
            header.focus();
            await waitFor(() => expect(header).toHaveAccessibleDescription(summary));
        }
        await waitFor(() => expect(enableBrowserTooltips ? source.title : tooltipTexts()[0]).toBe(summary));
        expect(getModelAsString).not.toHaveBeenCalled();
    });

    test.each([false, true])('formats each native preview once per summary refresh (group=%s)', async (group) => {
        const values = Array.from({ length: 13 }, (_, i) => `Value ${String(i + 1).padStart(2, '0')}`);
        const valueFormatter = vi.fn(({ value }: ValueFormatterParams) => `Formatted ${value}`);
        const api = await grids.createGridAndWait(
            'native-preview',
            {
                columnDefs: [
                    {
                        field: 'value',
                        filter: 'agSetColumnFilter',
                        floatingFilter: !group,
                        rowGroup: group,
                        hide: group,
                        filterParams: { valueFormatter },
                    },
                ],
                autoGroupColumnDef: { filter: 'agGroupColumnFilter', floatingFilter: true },
                rowData: values.map((value) => ({ value })),
                enableFilterHandlers,
                enableBrowserTooltips: true,
            },
            { modules: [SetFilterModule, RowGroupingModule, GroupFilterModule] }
        );
        const input = getGridElement(api)!.querySelector<HTMLInputElement>('.ag-floating-filter input')!;
        const source = input.closest<HTMLElement>('.ag-input-field')!;
        vi.spyOn(input, 'scrollWidth', 'get').mockReturnValue(2000);
        vi.spyOn(input, 'clientWidth', 'get').mockReturnValue(100);

        // The count changes first; the final update changes only a value beyond the abbreviated summary.
        for (const selected of [values.slice(0, 11), values.slice(0, 12), [...values.slice(0, 11), values[12]]]) {
            await api.setColumnFilterModel('value', { filterType: 'set', values: selected });
            valueFormatter.mockClear();
            api.onFilterChanged();
            const text = `(${selected.length}) ${selected.map((value) => `Formatted ${value}`).join(',')}`;
            await waitFor(() => expect(source.title).toBe(text));
            // The first value is formatted for both the summary and tooltip; the last only for the tooltip.
            const firstValueCalls = valueFormatter.mock.calls.filter(([params]) => params.value === selected[0]);
            const lastValueCalls = valueFormatter.mock.calls.filter(([params]) => params.value === selected.at(-1));
            expect(firstValueCalls).toHaveLength(lastValueCalls.length * 2);
        }
    });

    test.each([
        { filter: 'agTextColumnFilter', model: { filterType: 'text', type: 'contains', filter: 'A long text value' } },
        {
            filter: 'agNumberColumnFilter',
            model: { filterType: 'number', type: 'inRange', filter: 123456789, filterTo: 987654321 },
        },
        {
            filter: 'agDateColumnFilter',
            model: {
                filterType: 'date',
                type: 'inRange',
                dateFrom: '2026-01-01 00:00:00',
                dateTo: '2026-12-31 00:00:00',
            },
        },
    ])('describes a read-only $filter from its keyboard-focused header', async ({ filter, model }) => {
        const api = await grids.createGridAndWait(
            'read-only',
            {
                columnDefs: [
                    { field: 'value', filter, floatingFilter: true, filterParams: { readOnly: true } },
                    { colId: 'other', filter: 'agTextColumnFilter', floatingFilter: true },
                ],
                rowData: [{ value: 'A long text value' }],
                enableFilterHandlers,
                builtInTooltipComponent: InteractiveTooltip,
                tooltipInteraction: true,
            },
            { modules: [TextFilterModule, NumberFilterModule, DateFilterModule, RenderApiModule] }
        );
        await api.setColumnFilterModel('value', model);
        api.onFilterChanged();
        const header = getGridElement(api)!.querySelector<HTMLElement>('.ag-floating-filter')!;
        const input = header.querySelector<HTMLInputElement>('input:disabled')!;
        await waitFor(() => expect(input.value).not.toBe(''));
        vi.spyOn(input, 'scrollWidth', 'get').mockReturnValue(2000);
        vi.spyOn(input, 'clientWidth', 'get').mockReturnValue(100);
        header.focus();
        await waitFor(() => expect(tooltipTexts()).toEqual([input.value]));
        expect(header).toHaveAccessibleDescription(input.value);
        expect(input).not.toHaveAttribute('aria-describedby');
        const user = userEvent.setup();
        await user.keyboard('{Tab}');
        expect(getVisibleTooltips()[0].querySelector('button')).toHaveFocus();
        await user.keyboard('{Escape}');
        expect(header).toHaveFocus();
        expect(tooltipTexts()).toEqual([]);

        api.refreshHeader();
        const refreshedHeader = getGridElement(api)!.querySelector<HTMLElement>('.ag-floating-filter')!;
        expect(refreshedHeader).not.toBe(header);
        const refreshedInput = refreshedHeader.querySelector<HTMLInputElement>('input:disabled')!;
        vi.spyOn(refreshedInput, 'scrollWidth', 'get').mockReturnValue(2000);
        vi.spyOn(refreshedInput, 'clientWidth', 'get').mockReturnValue(100);
        refreshedHeader.focus();
        await waitFor(() => expect(refreshedHeader).toHaveAccessibleDescription(refreshedInput.value));
        await waitFor(() => expect(tooltipTexts()).toEqual([refreshedInput.value]));
    });

    test('shows every formatted Set Filter selection without expanding input or tool-panel summaries', async () => {
        const values = Array.from({ length: 12 }, (_, i) => `Value ${String(i + 1).padStart(2, '0')}`);
        const formattedValues = values.map((value) => `Formatted ${value}`);
        const api = await grids.createGridAndWait(
            'set',
            {
                columnDefs: [
                    {
                        field: 'value',
                        filter: 'agSetColumnFilter',
                        floatingFilter: true,
                        filterParams: {
                            valueFormatter: ({ value }: ValueFormatterParams) => `Formatted ${value}`,
                        },
                    },
                ],
                rowData: values.map((value) => ({ value })),
                enableFilterHandlers,
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
            },
            { modules: [SetFilterModule] }
        );
        await api.setColumnFilterModel('value', { filterType: 'set', values: values.slice(0, 11) });
        api.onFilterChanged();

        const source = getGridElement(api)!.querySelector<HTMLElement>(
            '.ag-set-floating-filter-input .ag-input-field'
        )!;
        const input = source.querySelector('input')!;
        const summary = `(11) ${formattedValues.slice(0, 10).join(',')},...`;
        await waitFor(() => expect(input.value).toBe(summary));
        vi.spyOn(input, 'scrollWidth', 'get').mockReturnValue(2000);
        vi.spyOn(input, 'clientWidth', 'get').mockReturnValue(100);

        const handler = api.getColumnFilterHandler<FilterHandler>('value')!;
        expect(handler.getModelAsString?.(api.getColumnFilterModel('value'), 'filterToolPanel')).toBe(
            `is (${formattedValues.slice(0, 3).join(', ')}) and 8 more`
        );

        const user = userEvent.setup();
        await user.hover(source);
        await waitFor(() => expect(tooltipTexts()).toEqual([`(11) ${formattedValues.slice(0, 11).join(',')}`]));

        await api.setColumnFilterModel('value', { filterType: 'set', values: [...values.slice(0, 10), values[11]] });
        api.onFilterChanged();
        await waitFor(() => expect(tooltipTexts()).toEqual([]));
        expect(input.value).toBe(summary);

        await user.unhover(source);
        await user.hover(source);
        const updatedTooltip = `(11) ${[...formattedValues.slice(0, 10), formattedValues[11]].join(',')}`;
        await waitFor(() => expect(tooltipTexts()).toEqual([updatedTooltip]));

        await user.unhover(source);
        const header = source.closest<HTMLElement>('.ag-floating-filter')!;
        header.focus();
        await waitFor(() => expect(header).toHaveAccessibleDescription(updatedTooltip));
        expect(input).not.toHaveAttribute('aria-describedby');
        await user.keyboard('{Enter}');
        expect(header.querySelector('button')).toHaveFocus();
        await waitFor(() => expect(tooltipTexts()).toEqual(['Open filter']));
        await user.keyboard('{Escape}');
        expect(header.querySelector('button')).toHaveFocus();
        expect(tooltipTexts()).toEqual([]);
        await user.keyboard('{Escape}');
        expect(header).toHaveFocus();
        await waitFor(() => expect(tooltipTexts()).toEqual([updatedTooltip]));

        await api.setColumnFilterModel('value', null);
        api.onFilterChanged();
        await waitFor(() => expect(input.value).toBe(''));
        expect(tooltipTexts()).toEqual([]);
    });

    test.each(['agTextColumnFilter', 'agSetColumnFilter'])(
        'shows the full value for the group read-only input backed by %s',
        async (filter) => {
            const values = Array.from({ length: 12 }, (_, i) => `A long group filter value ${i + 1}`);
            const isSetFilter = filter === 'agSetColumnFilter';
            const api = await grids.createGridAndWait(
                'group',
                {
                    columnDefs: [{ field: 'country', rowGroup: true, hide: true, filter }],
                    autoGroupColumnDef: { filter: 'agGroupColumnFilter', floatingFilter: true },
                    rowData: values.map((country) => ({ country })),
                    enableFilterHandlers,
                    tooltipShowDelay: 0,
                    tooltipSwitchShowDelay: 0,
                },
                { modules: [RowGroupingModule, GroupFilterModule, TextFilterModule, SetFilterModule] }
            );
            await api.setColumnFilterModel(
                'country',
                isSetFilter
                    ? { filterType: 'set', values: values.slice(0, 11) }
                    : { filterType: 'text', type: 'contains', filter: values[0] }
            );
            api.onFilterChanged();

            const source = getGridElement(api)!.querySelector<HTMLElement>(
                '.ag-group-floating-filter .ag-input-field'
            )!;
            const input = source.querySelector('input')!;
            const summary = isSetFilter ? `(11) ${values.slice(0, 10).join(',')},...` : values[0];
            const tooltip = isSetFilter ? `(11) ${values.slice(0, 11).join(',')}` : values[0];
            await waitFor(() => expect(input.value).toBe(summary));
            expect(input.disabled).toBe(true);
            vi.spyOn(input, 'scrollWidth', 'get').mockReturnValue(2000);
            vi.spyOn(input, 'clientWidth', 'get').mockReturnValue(100);

            await userEvent.setup().hover(source);
            await waitFor(() => expect(tooltipTexts()).toEqual([tooltip]));

            const header = source.closest<HTMLElement>('.ag-floating-filter')!;
            header.focus();
            await waitFor(() => expect(header).toHaveAccessibleDescription(tooltip));

            await api.setColumnFilterModel('country', null);
            api.onFilterChanged();
            await waitFor(() => expect(input.value).toBe(''));
            expect(tooltipTexts()).toEqual([]);
        }
    );

    test('follows the active number input when switching between editable and read-only models', async () => {
        const api = await grids.createGridAndWait(
            'number',
            {
                columnDefs: [{ field: 'value', filter: 'agNumberColumnFilter', floatingFilter: true }],
                rowData: [{ value: 123456789 }],
                enableFilterHandlers,
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
            },
            { modules: [NumberFilterModule] }
        );
        const source = getGridElement(api)!.querySelector<HTMLElement>('.ag-floating-filter-input')!;
        const numberInput = source.querySelector<HTMLInputElement>('input[type="number"]')!;
        const textInput = source.querySelector<HTMLInputElement>('input[type="text"]')!;
        for (const input of [numberInput, textInput]) {
            vi.spyOn(input, 'scrollWidth', 'get').mockReturnValue(2000);
            vi.spyOn(input, 'clientWidth', 'get').mockReturnValue(100);
        }

        const cases: { model: NumberFilterModel; input: HTMLInputElement; value: string }[] = [
            {
                model: { filterType: 'number', type: 'equals', filter: 123456789 },
                input: numberInput,
                value: '123456789',
            },
            {
                model: { filterType: 'number', type: 'inRange', filter: 100000000, filterTo: 200000000 },
                input: textInput,
                value: '100000000-200000000',
            },
            {
                model: { filterType: 'number', type: 'equals', filter: 987654321 },
                input: numberInput,
                value: '987654321',
            },
        ];
        const user = userEvent.setup();
        for (const { model, input, value } of cases) {
            await api.setColumnFilterModel('value', model);
            api.onFilterChanged();
            await waitFor(() => expect(input.value).toBe(value));
            expect(input.closest('.ag-hidden')).toBeNull();
            await user.hover(source);
            await waitFor(() => expect(tooltipTexts()).toEqual([value]));
            await user.unhover(source);
            await waitFor(() => expect(tooltipTexts()).toEqual([]));
        }
    });
});

describe('Floating filter tooltip formatting', () => {
    const grids = new TestGridsManager();

    afterEach(() => {
        grids.reset();
        vi.restoreAllMocks();
    });

    test.each([false, true])(
        'resolves expanded values only when truncated (browser=%s)',
        async (enableBrowserTooltips) => {
            const values = Array.from({ length: 12 }, (_, i) => `Value ${i + 1}`);
            const valueFormatter = vi.fn(({ value }: ValueFormatterParams) => `Formatted ${value}`);
            const api = await grids.createGridAndWait(
                'truncation',
                {
                    columnDefs: [
                        {
                            field: 'value',
                            filter: 'agSetColumnFilter',
                            floatingFilter: true,
                            filterParams: { valueFormatter },
                        },
                    ],
                    rowData: values.map((value) => ({ value })),
                    enableFilterHandlers: true,
                    enableBrowserTooltips,
                    tooltipShowDelay: 0,
                },
                { modules: [SetFilterModule, TooltipModule] }
            );
            const source = getGridElement(api)!.querySelector<HTMLElement>(
                '.ag-set-floating-filter-input .ag-input-field'
            )!;
            const input = source.querySelector('input')!;
            vi.spyOn(input, 'scrollWidth', 'get').mockReturnValue(100);
            vi.spyOn(input, 'clientWidth', 'get').mockReturnValue(200);
            vi.spyOn(input, 'scrollHeight', 'get').mockReturnValue(20);
            vi.spyOn(input, 'clientHeight', 'get').mockReturnValue(20);
            valueFormatter.mockClear();
            await api.setColumnFilterModel('value', { filterType: 'set', values: values.slice(0, 11) });
            api.onFilterChanged();
            await waitFor(() => expect(input.value).toContain('(11)'));
            const user = userEvent.setup();
            await user.hover(source);
            expect(valueFormatter.mock.calls.map(([params]) => params.value)).not.toContain(values[10]);

            vi.spyOn(input, 'scrollWidth', 'get').mockReturnValue(2000);
            // Refresh the model to update native titles and invalidate the expanded summary.
            await api.setColumnFilterModel('value', {
                filterType: 'set',
                values: [...values.slice(0, 10), values[11]],
            });
            api.onFilterChanged();
            await user.unhover(source);
            await user.hover(source);
            const text = `(11) ${[...values.slice(0, 10), values[11]].map((value) => `Formatted ${value}`).join(',')}`;
            await waitFor(() =>
                expect(enableBrowserTooltips ? source.title : getVisibleTooltips()[0]?.textContent).toBe(text)
            );
            if (!enableBrowserTooltips) {
                expect(valueFormatter.mock.calls.filter(([params]) => params.value === values[11])).toHaveLength(1);
            }
        }
    );

    test.each<{ name: string; modules: Module[]; suppressBuiltInTooltips: boolean }>([
        { name: 'without TooltipModule', modules: [], suppressBuiltInTooltips: false },
        { name: 'with tooltips suppressed', modules: [TooltipModule], suppressBuiltInTooltips: true },
        { name: 'before showing a tooltip', modules: [TooltipModule], suppressBuiltInTooltips: false },
    ])('does not format selections beyond the input summary $name', async ({ modules, suppressBuiltInTooltips }) => {
        const values = Array.from({ length: 12 }, (_, i) => `Value ${i + 1}`);
        const valueFormatter = vi.fn(({ value }: ValueFormatterParams) => `Formatted ${value}`);
        const api = await grids.createGridAndWait(
            'lazy',
            {
                columnDefs: [
                    {
                        field: 'value',
                        filter: 'agSetColumnFilter',
                        floatingFilter: true,
                        filterParams: { valueFormatter },
                    },
                ],
                rowData: values.map((value) => ({ value })),
                enableFilterHandlers: true,
                suppressBuiltInTooltips,
            },
            { modules: [SetFilterModule, ...modules] }
        );
        valueFormatter.mockClear();
        await api.setColumnFilterModel('value', { filterType: 'set', values: values.slice(0, 11) });
        api.onFilterChanged();
        const input = getGridElement(api)!.querySelector<HTMLInputElement>('.ag-set-floating-filter-input input')!;
        await waitFor(() =>
            expect(input.value).toBe(
                `(11) ${values
                    .slice(0, 10)
                    .map((value) => `Formatted ${value}`)
                    .join(',')},...`
            )
        );
        expect(valueFormatter.mock.calls.map(([params]) => params.value)).not.toContain(values[10]);
    });
});
