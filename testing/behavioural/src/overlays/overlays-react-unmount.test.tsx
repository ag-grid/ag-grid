import '@testing-library/jest-dom';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import type { AgGridReactProps } from 'ag-grid-react';

import { asyncSetTimeout } from '../test-utils';

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

    afterEach(() => {
        vitest.resetAllMocks();
    });

    class CustomLoadingOverlay extends React.Component {
        override render() {
            return <div>Custom Overlay</div>;
        }

        override componentDidMount() {
            // console.log('mounts');
            ++mounts;
        }

        override componentWillUnmount() {
            // console.log('unmounts');
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

            await asyncSetTimeout(1); // unmount will be called on the next tick

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

            await asyncSetTimeout(1); // unmount will be called on the next tick

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

            await asyncSetTimeout(1); // unmount will be called on the next tick

            expect(mounts).toBe(1);
            expect(unmounts).toBe(1);
        });
    });

    test('quick toggle with race conditions disposes all beans (fuzz test for AG-9318)', async () => {
        let ref!: AgGridReact;
        const setRef = (r: AgGridReact) => (ref = r);
        const defaultProps: AgGridReactProps<any> = {
            columnDefs,
            rowData: [{}],
            loadingOverlayComponent: () => <CustomLoadingOverlay />,
            noRowsOverlayComponent: () => <CustomLoadingOverlay />,
        };

        const { rerender } = render(<AgGridReact {...defaultProps} ref={setRef} />);

        let randomTimeoutsIndex = 0;
        const randomTimeouts = [
            2, 4, 3, 2, 1, 4, 0, 3, 3, 2, 0, 3, 3, 1, 0, 3, 2, 1, 0, 1, 2, 4, 2, 0, 3, 4, 2, 1, 4, 3,
        ];

        for (let i = 0; i < 20; ++i) {
            // We need to randomize timer resolution to simulate potential race conditions
            const originalSetTimeout = global.setTimeout;
            const setTimeoutSpy = vitest.spyOn(global, 'setTimeout').mockImplementation((cb, ms, ...args) => {
                ms = randomTimeouts[randomTimeoutsIndex++ % randomTimeouts.length];
                if (typeof cb === 'function') {
                    const originalCb = cb;
                    cb = (...args: any[]) => act(() => originalCb(...args));
                }
                return originalSetTimeout(cb, ms, ...args);
            });

            const loading = i % 2 === 0;

            rerender(<AgGridReact {...defaultProps} ref={setRef} loading={loading} />);
            if (!loading) {
                ref.api.showNoRowsOverlay();
                ref.api.showNoRowsOverlay();
                ref.api.hideOverlay();
                ref.api.showNoRowsOverlay();
                ref.api.showNoRowsOverlay();
            }

            setTimeoutSpy.mockRestore();

            await waitFor(() => expect(screen.queryByText('Custom Overlay')).toBeInTheDocument());
        }

        rerender(<AgGridReact {...defaultProps} ref={setRef} loading={false} />);
        ref.api.hideOverlay();

        await waitFor(() => expect(screen.queryByText('Custom Overlay')).not.toBeInTheDocument());

        for (let retry = 0; retry < 100; ++retry) {
            await asyncSetTimeout(1);
            if (mounts - unmounts === 0) {
                break;
            }
        }

        expect(mounts - unmounts).toBe(0);

        expect(randomTimeoutsIndex).toBeGreaterThan(0); // Ensure our fake timer was called
    });
});
