import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColGroupDef, GridApi, IHeaderGroupParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

let refreshedWith: string[] = [];

class ReactInnerHeaderGroup extends React.Component<IHeaderGroupParams> {
    public refresh(params: IHeaderGroupParams & { suffix?: string }): boolean {
        refreshedWith.push(params.displayName + (params.suffix ?? ''));
        return true;
    }

    public override render(): React.ReactNode {
        return <span className="test-react-inner">{this.props.displayName}</span>;
    }
}

describe('React inner header group component across a header name change', () => {
    afterEach(() => cleanup());

    test('a React class inner header group component is refreshed in place with its params', async () => {
        refreshedWith = [];
        const apiRef: { current?: GridApi } = {};
        const columnDefs: ColGroupDef[] = [
            {
                groupId: 'g',
                headerName: 'Name',
                headerGroupComponentParams: {
                    innerHeaderGroupComponent: ReactInnerHeaderGroup,
                    innerHeaderGroupComponentParams: { suffix: '!' },
                },
                children: [{ field: 'a' }],
            },
        ];
        const view = render(
            <React.StrictMode>
                <AgGridReact
                    rowData={[{ a: 1 }]}
                    columnDefs={columnDefs}
                    modules={[ClientSideRowModelModule, ColumnApiModule]}
                    onGridReady={(e) => (apiRef.current = e.api)}
                />
            </React.StrictMode>
        );
        const inner = () => view.container.querySelector('.ag-header-group-cell .test-react-inner');
        await waitFor(() => expect(inner()?.textContent).toBe('Name'));
        const before = inner();

        await act(async () => {
            apiRef.current!.applyColumnState({ state: [{ colId: 'a', headerName: 'Renamed' }] });
        });

        await waitFor(() => expect(refreshedWith).toEqual(['Name!']));
        expect({ kept: inner() === before, text: inner()?.textContent }).toEqual({ kept: true, text: 'Name' });
    });

    test('a column definition update renaming a group refreshes its React inner header group component in place', async () => {
        refreshedWith = [];
        const groupDefs = (headerName: string): ColGroupDef[] => [
            {
                groupId: 'g',
                headerName,
                headerGroupComponentParams: { innerHeaderGroupComponent: ReactInnerHeaderGroup },
                children: [{ field: 'a' }],
            },
        ];
        const grid = (headerName: string) => (
            <React.StrictMode>
                <AgGridReact
                    rowData={[{ a: 1 }]}
                    columnDefs={groupDefs(headerName)}
                    modules={[ClientSideRowModelModule, ColumnApiModule]}
                />
            </React.StrictMode>
        );
        const view = render(grid('Name'));
        const groupCell = () => view.container.querySelector('.ag-header-group-cell');
        await waitFor(() => expect(groupCell()?.textContent).toContain('Name'));
        const before = groupCell();

        view.rerender(grid('Renamed'));

        await waitFor(() => expect(refreshedWith).toEqual(['Renamed']));
        expect(groupCell() === before).toBe(true);
    });
});
