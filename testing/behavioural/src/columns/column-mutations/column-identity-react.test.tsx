import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import React, { useEffect } from 'react';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';

import type { ColDef, ColGroupDef, IHeaderGroupParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

describe('a column group without groupId kept by a columnDefs update (React)', () => {
    beforeAll(() => {
        mockGridLayout.init();
    });

    afterEach(() => {
        cleanup();
    });

    let mounts = 0;
    const CountedGroupHeader = (props: IHeaderGroupParams) => {
        useEffect(() => {
            ++mounts;
        }, []);
        return <span className="counted-group-header">{props.displayName}</span>;
    };

    // Each call builds fresh definition objects, as a re-render of a parent component does.
    const columnDefs = (extra: ColDef[] = []): (ColDef | ColGroupDef)[] => [
        { field: 'a' },
        {
            headerName: 'G',
            headerGroupComponent: CountedGroupHeader,
            children: [{ field: 'c' }, { field: 'd' }],
        },
        ...extra,
    ];
    const grid = (defs: (ColDef | ColGroupDef)[]) => (
        <React.StrictMode>
            <AgGridReact
                modules={[ClientSideRowModelModule]}
                suppressColumnVirtualisation
                columnDefs={defs}
                rowData={[{ a: 1, c: 3, d: 4, e: 5 }]}
            />
        </React.StrictMode>
    );
    const groupCells = () =>
        Array.from(document.querySelectorAll<HTMLElement>('.ag-header-group-cell:not(.ag-header-group-cell-no-group)'));
    const flush = () =>
        act(async () => {
            await asyncSetTimeout(0);
        });

    test('rerendering with equal fresh columnDefs does not remount its headerGroupComponent or replace its cell', async () => {
        mounts = 0;
        const view = render(grid(columnDefs()));
        await waitFor(() => expect(document.querySelectorAll('.counted-group-header').length).toBe(1));
        expect(mounts).toBeGreaterThan(0);
        const mountsBefore = mounts;
        const cellBefore = groupCells()[0];

        view.rerender(grid(columnDefs()));
        await flush();
        expect({ mounts: mounts - mountsBefore, sameCell: groupCells().map((cell) => cell === cellBefore) }).toEqual({
            mounts: 0,
            sameCell: [true],
        });

        // A column added after it is the signal the update reached the header: the group is still the same one.
        view.rerender(grid(columnDefs([{ field: 'e' }])));
        await waitFor(() => expect(document.querySelector('.ag-header-cell[col-id="e"]')).not.toBeNull());
        expect({ mounts: mounts - mountsBefore, sameCell: groupCells().map((cell) => cell === cellBefore) }).toEqual({
            mounts: 0,
            sameCell: [true],
        });
    });
});
