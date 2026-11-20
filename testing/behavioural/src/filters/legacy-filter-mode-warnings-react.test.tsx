import { cleanup, render, waitFor } from '@testing-library/react';
import { _doOnce } from 'ag-stack';
import React from 'react';

import type { IssueRaisedEvent } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    TextFilterModule,
    ValidationModule,
    _resetValidationLogging,
    enableDevValidations,
} from 'ag-grid-community';
import type { CustomFloatingFilterProps } from 'ag-grid-react';
import { AgGridReact, useGridFilter } from 'ag-grid-react';

const HooksFilter = () => {
    useGridFilter({ doesFilterPass: () => true });
    return <div />;
};

const HooksFloatingFilter = ({ model }: CustomFloatingFilterProps) => <input readOnly value={model ?? ''} />;

describe('legacy filter mode warnings (React)', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    test('hooks filter and floating filter components are reported when the grid starts', async () => {
        _resetValidationLogging();
        _doOnce._set.clear();
        enableDevValidations({ throwOn: [], showOverlayOn: [] });
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const raised: number[] = [];
        const onIssueRaised = (event: IssueRaisedEvent) => {
            if (event.attributedToThisGrid) {
                raised.push(event.id as number);
            }
        };

        render(
            <div style={{ width: 400, height: 300 }}>
                <AgGridReact
                    modules={[ClientSideRowModelModule, CustomFilterModule, TextFilterModule, ValidationModule]}
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
});
