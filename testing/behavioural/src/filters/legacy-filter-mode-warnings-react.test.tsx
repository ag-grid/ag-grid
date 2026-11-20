import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { _doOnce } from 'ag-stack';
import React from 'react';

import type { GridApi, IssueRaisedEvent } from 'ag-grid-community';
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
import type { CustomFloatingFilterProps } from 'ag-grid-react';
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
