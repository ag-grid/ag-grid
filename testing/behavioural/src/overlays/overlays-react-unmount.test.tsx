import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColDef } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import type { AgGridReactProps } from '@ag-grid-community/react';
import '@testing-library/jest-dom';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

describe('ag-grid custom overlay react unmount', () => {
    const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];

    beforeAll(() => {
        ModuleRegistry.register(ClientSideRowModelModule);
    });

    let mounts = 0;
    let unmounts = 0;

    beforeEach(() => {
        cleanup();
        mounts = 0;
        unmounts = 0;
    });

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

    describe('loading transition', () => {
        test('transition loading true -> false', async () => {
            const defaultProps: AgGridReactProps<any> = {
                columnDefs,
                rowData: [],
                loadingOverlayComponent: CustomLoadingOverlay,
            };

            const { rerender } = render(<AgGridReact {...defaultProps} loading={true} />);

            await waitFor(() => expect(screen.queryByText('Custom Overlay')).toBeInTheDocument());

            expect(mounts).toBe(1);

            rerender(<AgGridReact {...defaultProps} loading={false} />);

            await waitFor(() => expect(screen.queryByText('Custom Overlay')).not.toBeInTheDocument());

            await new Promise((resolve) => setTimeout(resolve)); // unmount will be called on the next tick

            expect(mounts).toBe(1);
            expect(unmounts).toBe(1);
        });

        test('transition loading false -> true', async () => {
            const defaultProps: AgGridReactProps<any> = {
                columnDefs,
                rowData: [],
                loadingOverlayComponent: CustomLoadingOverlay,
            };

            const { rerender } = render(<AgGridReact {...defaultProps} loading={false} />);

            await waitFor(() => expect(screen.queryByText('Custom Overlay')).not.toBeInTheDocument());

            expect(mounts).toBe(0);

            rerender(<AgGridReact {...defaultProps} loading={true} />);

            await waitFor(() => expect(screen.queryByText('Custom Overlay')).toBeInTheDocument());

            expect(mounts).toBe(1);

            rerender(<AgGridReact {...defaultProps} loading={false} />);

            await waitFor(() => expect(screen.queryByText('Custom Overlay')).not.toBeInTheDocument());

            await new Promise((resolve) => setTimeout(resolve)); // unmount will be called on the next tick

            expect(mounts).toBe(1);
            expect(unmounts).toBe(1);
        });

        test('loading undefined', async () => {
            const defaultProps: AgGridReactProps<any> = {
                columnDefs,
                loadingOverlayComponent: CustomLoadingOverlay,
            };

            const { rerender } = render(<AgGridReact {...defaultProps} />);

            await waitFor(() => expect(screen.queryByText('Custom Overlay')).toBeInTheDocument());

            expect(mounts).toBe(1);

            rerender(<AgGridReact {...defaultProps} rowData={[{}]} />);

            await waitFor(() => expect(screen.queryByText('Custom Overlay')).not.toBeInTheDocument());

            await new Promise((resolve) => setTimeout(resolve)); // unmount will be called on the next tick

            expect(mounts).toBe(1);
            expect(unmounts).toBe(1);
        });
    });
});
