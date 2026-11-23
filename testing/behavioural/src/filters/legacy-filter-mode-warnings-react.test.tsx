import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { _doOnce } from 'ag-stack';
import { LEGACY_FILTER_WARNING_IDS } from 'ag-test-utils';
import React from 'react';

import type { ColDef, GridApi, GridOptions, IssueRaisedEvent } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    RowApiModule,
    TextFilterModule,
    ValidationModule,
    _resetValidationLogging,
    enableDevValidations,
} from 'ag-grid-community';
import { MultiFilterModule } from 'ag-grid-enterprise';
import type {
    CustomFilterDisplayProps,
    CustomFilterProps,
    CustomFloatingFilterDisplayProps,
    CustomFloatingFilterProps,
} from 'ag-grid-react';
import { AgGridReact, useGridFilter } from 'ag-grid-react';

const HooksFilter = () => {
    useGridFilter({ doesFilterPass: () => true });
    return <div />;
};

const HooksFloatingFilter = ({ model }: CustomFloatingFilterProps) => <input readOnly value={model ?? ''} />;

const MultiChildFloatingFilter = ({ onModelChange }: CustomFloatingFilterProps) => (
    <input
        data-testid="multi-floating-filter"
        onChange={(e) =>
            onModelChange({
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'contains', filter: e.target.value }],
            })
        }
    />
);

const modules = [
    ClientSideRowModelModule,
    CustomFilterModule,
    RowApiModule,
    TextFilterModule,
    MultiFilterModule,
    ValidationModule,
];

describe('legacy filter mode warnings (React)', () => {
    let raised: number[];
    const onIssueRaised = (event: IssueRaisedEvent) => {
        if (event.attributedToThisGrid) {
            raised.push(event.id as number);
        }
    };

    beforeEach(() => {
        _resetValidationLogging();
        _doOnce._set.clear();
        enableDevValidations({ throwOn: [], showOverlayOn: [] });
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        raised = [];
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    test('hooks filter and floating filter components are reported when the grid starts', async () => {
        render(
            <div style={{ width: 400, height: 300 }}>
                <AgGridReact
                    modules={modules}
                    rowData={[{ name: 'Alpha' }]}
                    columnDefs={[
                        {
                            field: 'name',
                            filter: HooksFilter,
                            floatingFilter: true,
                            floatingFilterComponent: HooksFloatingFilter,
                        },
                    ]}
                    onIssueRaised={onIssueRaised}
                />
            </div>
        );

        await waitFor(() => expect(raised).toEqual(expect.arrayContaining([343, 344])));
    });

    test('a floating filter setting a Multi Filter model is not reported as a legacy method call', async () => {
        let api: GridApi | undefined;
        render(
            <div style={{ width: 400, height: 300 }}>
                <AgGridReact
                    modules={modules}
                    rowData={[{ name: 'Alpha' }, { name: 'Bravo' }]}
                    columnDefs={[
                        {
                            field: 'name',
                            filter: 'agMultiColumnFilter',
                            floatingFilter: true,
                            floatingFilterComponent: MultiChildFloatingFilter,
                        },
                    ]}
                    onIssueRaised={onIssueRaised}
                    onGridReady={(event) => {
                        api = event.api;
                    }}
                />
            </div>
        );

        fireEvent.change(await screen.findByTestId('multi-floating-filter'), { target: { value: 'Alpha' } });

        await waitFor(() => expect(api!.getDisplayedRowCount()).toBe(1));
        expect(raised).not.toContain(347);
    });
});

const containsRow = (model: string | null, value: unknown) =>
    model == null || String(value).toLowerCase().includes(model.toLowerCase());
const containsPass = ({ model, node, handlerParams }: any) => containsRow(model, handlerParams.getValue(node));
const text = (filter: string) => ({ filterType: 'text', type: 'contains', filter });

const LegacyHookContains = ({ model, getValue }: CustomFilterProps) => {
    useGridFilter({ doesFilterPass: ({ node }) => containsRow(model, getValue(node)) });
    return <div />;
};

const DisplayContains = ({ model, onModelChange }: CustomFilterDisplayProps) => (
    <input value={model ?? ''} onChange={(e) => onModelChange(e.target.value || null)} />
);

/** Reads only `model` and `onModelChange`, which both modes provide. */
const ModelOnlyFloating = ({ onModelChange }: CustomFloatingFilterProps) => (
    <input data-testid="ff" onChange={(e) => onModelChange(e.target.value ? text(e.target.value) : null)} />
);

const ParentInstanceFloating = ({ parentFilterInstance }: CustomFloatingFilterProps) => (
    <input
        data-testid="ff"
        onChange={(e) =>
            parentFilterInstance((instance: any) => {
                instance.onFloatingFilterChanged('contains', e.target.value);
            })
        }
    />
);

const DisplayFloating = ({ onModelChange }: CustomFloatingFilterDisplayProps) => (
    <input data-testid="ff" onChange={(e) => onModelChange(e.target.value ? text(e.target.value) : null)} />
);

interface ReactEntry {
    name: string;
    columnDefs: ColDef[];
    gridProps?: GridOptions;
    /** Types into the floating filter instead of calling `setColumnFilterModel`. */
    typeInFloating?: boolean;
    model?: unknown;
    warn: number[];
    existingWarn?: number;
}

const col = (def: ColDef): ColDef => ({ field: 'name', ...def });

const reactEntries: ReactEntry[] = [
    {
        name: 'hooks filter',
        columnDefs: [col({ filter: LegacyHookContains })],
        model: 'alp',
        warn: [343],
    },
    {
        name: 'display filter with { component, doesFilterPass }',
        columnDefs: [col({ filter: { component: DisplayContains, doesFilterPass: containsPass } })],
        model: 'alp',
        warn: [],
        existingWarn: 335,
    },
    {
        name: 'built-in text filter and floating filter',
        columnDefs: [col({ filter: 'agTextColumnFilter', floatingFilter: true })],
        model: text('alp'),
        warn: [],
    },
    {
        name: 'built-in Multi Filter with buttons',
        columnDefs: [col({ filter: 'agMultiColumnFilter', filterParams: { buttons: ['apply'] } })],
        model: { filterType: 'multi', filterModels: [text('alp'), null] },
        warn: [346],
    },
    {
        name: 'Multi Filter with a hooks child',
        columnDefs: [
            col({ filter: 'agMultiColumnFilter', filterParams: { filters: [{ filter: LegacyHookContains }] } }),
        ],
        model: { filterType: 'multi', filterModels: ['alp'] },
        warn: [343],
    },
    {
        name: 'floating filter reading only model and onModelChange',
        columnDefs: [
            col({ filter: 'agTextColumnFilter', floatingFilter: true, floatingFilterComponent: ModelOnlyFloating }),
        ],
        typeInFloating: true,
        warn: [344],
    },
    {
        name: 'floating filter using parentFilterInstance',
        columnDefs: [
            col({
                filter: 'agTextColumnFilter',
                floatingFilter: true,
                floatingFilterComponent: ParentInstanceFloating,
            }),
        ],
        typeInFloating: true,
        warn: [344],
    },
    {
        name: 'handler-style floating filter display',
        columnDefs: [
            col({ filter: 'agTextColumnFilter', floatingFilter: true, floatingFilterComponent: DisplayFloating }),
        ],
        typeInFloating: true,
        warn: [344],
    },
    {
        name: 'onFilterChanged prop',
        columnDefs: [col({ filter: 'agTextColumnFilter' })],
        gridProps: { onFilterChanged: () => {} },
        model: text('alp'),
        warn: [],
    },
    {
        name: 'onFilterModified prop',
        columnDefs: [col({ filter: 'agTextColumnFilter' })],
        gridProps: { onFilterModified: () => {} },
        model: text('alp'),
        warn: [345],
    },
];

describe('legacy filter mode matrix (React)', () => {
    let raised: number[];
    const onIssueRaised = (event: IssueRaisedEvent) => {
        if (event.attributedToThisGrid) {
            raised.push(event.id as number);
        }
    };

    beforeEach(() => {
        _resetValidationLogging();
        _doOnce._set.clear();
        enableDevValidations({ throwOn: [], showOverlayOn: [] });
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    const run = async (entry: ReactEntry, enableFilterHandlers: boolean | undefined) => {
        raised = [];
        let api: GridApi | undefined;
        render(
            <div style={{ width: 400, height: 300 }}>
                <AgGridReact
                    modules={modules}
                    rowData={[{ name: 'Alpha' }, { name: 'Alphabet' }, { name: 'Bravo' }]}
                    columnDefs={entry.columnDefs}
                    {...entry.gridProps}
                    {...(enableFilterHandlers === undefined ? {} : { enableFilterHandlers })}
                    onIssueRaised={onIssueRaised}
                    onGridReady={(event) => {
                        api = event.api;
                    }}
                />
            </div>
        );
        await waitFor(() => expect(api).toBeDefined());
        let outcome: unknown;
        try {
            if (entry.typeInFloating) {
                fireEvent.change(await screen.findByTestId('ff'), { target: { value: 'alp' } });
                await waitFor(() => expect(api!.getColumnFilterModel('name')).not.toBeNull());
            } else {
                await api!.setColumnFilterModel('name', entry.model);
            }
            outcome = [api!.getDisplayedRowCount(), api!.getColumnFilterModel('name')];
        } catch (e) {
            outcome = `THROWS ${(e as Error).message.slice(0, 80)}`;
        }
        const isLegacyId = (id: number) => LEGACY_FILTER_WARNING_IDS.some((legacyId) => legacyId === id);
        const ids = [...new Set(raised)].filter(isLegacyId).sort();
        const result = {
            ids,
            otherIds: raised.filter((id) => !isLegacyId(id)),
            outcome: JSON.stringify(outcome),
        };
        cleanup();
        return result;
    };

    test.each(reactEntries.map((entry) => [entry.name, entry] as const))('%s', async (_name, entry) => {
        const unset = await run(entry, undefined);
        const handlers = await run(entry, true);

        console.log(
            `REACT ${entry.name}\n  unset ${JSON.stringify(unset.ids)} ${unset.outcome}\n  true  ${JSON.stringify(handlers.ids)} ${handlers.outcome}`
        );

        expect(unset.ids).toEqual(entry.warn);
        expect(handlers.ids).toEqual([]);
        if (entry.existingWarn) {
            expect(unset.otherIds).toContain(entry.existingWarn);
        } else if (entry.warn.length === 0) {
            expect(unset.outcome).not.toMatch(/THROWS/);
            expect(unset.outcome).toBe(handlers.outcome);
        }
    });
});
