import { cleanup, render } from '@testing-library/react';
import React, { Suspense, act, useState } from 'react';

import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

describe('React Suspense', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule]);
    });

    beforeEach(() => {
        cleanup();
    });

    test('Should suspend with no error', async () => {
        let didSuspend = false;
        const InnerComponent = (props) => {
            const { rowData, setRowData } = props;
            if (!didSuspend) {
                didSuspend = true;
                const promise = new Promise((resolve) => {
                    setTimeout(() => {
                        resolve('Success!');

                        setTimeout(() => {
                            setRowData([...rowData, { item: 'bar' }]);
                        }, 10);
                    }, 10);
                });
                throw promise;
            }

            return <div>inner component</div>;
        };

        const AgGridWrapper = () => {
            const [rowData, setRowData] = useState([{ item: 'foo' }]);
            const [isModalOpen, setIsModalOpen] = useState(false);
            return (
                <div>
                    <button type="button" onClick={() => setIsModalOpen(true)}>
                        Suspend Ag Grid
                    </button>
                    <AgGridReact
                        rowHeight={80}
                        rowData={rowData}
                        getRowId={(data) => data.data.item}
                        // debug
                        columnDefs={[
                            {
                                resizable: true,
                                headerName: 'Item',
                                field: 'item',
                            },
                        ]}
                    />
                    {isModalOpen ? <InnerComponent rowData={rowData} setRowData={setRowData} /> : null}
                </div>
            );
        };

        const { getByText, findByText } = render(
            <Suspense fallback="hit suspense">
                <AgGridWrapper />
            </Suspense>
        );

        expect(await findByText('foo')).toBeVisible();

        act(() => {
            getByText('Suspend Ag Grid').click();
        });

        expect(await findByText('foo')).toBeVisible();
        expect(await findByText('bar')).toBeVisible();
    });
});
