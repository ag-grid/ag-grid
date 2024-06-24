import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColDef } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import type { AgGridReactProps } from '@ag-grid-community/react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

describe('ag-grid custom overlay react unmount', () => {
    const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];

    beforeAll(() => {
        ModuleRegistry.register(ClientSideRowModelModule);
    });

    beforeEach(() => {
        cleanup();
    });

    test('react render of loading and no-rows', async () => {
        let mounts = 0;
        let unmounts = 0;

        class CustomLoadingOverlay extends React.Component {
            override render() {
                return <div>Custom Overlay</div>;
            }

            override componentDidMount() {
                ++mounts;
            }

            override componentWillUnmount() {
                ++unmounts;
            }
        }

        const defaultProps: AgGridReactProps<any> = {
            columnDefs,
            rowData: [],
            loadingOverlayComponent: () => {
                return <CustomLoadingOverlay />;
            },
        };

        const { rerender } = render(<AgGridReact {...defaultProps} loading={true} />);

        await waitFor(() => expect(screen.queryByText('Custom Overlay')).toBeInTheDocument());

        expect(unmounts).toBe(0);
        expect(mounts).toBe(2); // is 2!!!

        rerender(<AgGridReact {...defaultProps} loading={false} />);

        await waitFor(() => expect(screen.queryByText('Custom Overlay')).not.toBeInTheDocument());

        expect(unmounts).toBe(1); // is 0!!!
    });
});
