import { waitFor } from '@testing-library/dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import React, { Suspense, useState } from 'react';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

/**
 * Issue: when a Suspense boundary hides an already-shown grid and then reveals it again, the grid is recreated
 * from the props of the very first render instead of the current props. An event handler prop that was swapped
 * while the grid was visible is ignored, and the original handler is called instead.
 *
 * Setup: `<AgGridReact onGridReady={version === 1 ? handlerA : handlerB} />` inside `<Suspense>` in a concurrent
 * root. All other props are stable references. The handler prop is swapped from A to B while the grid is visible,
 * then a child of the boundary suspends (the grid is hidden), then the promise resolves (the grid is revealed)
 * with no further prop change.
 *
 * Expected: the Updating Grid Options docs say, for React, "Simply update your state and the grid will respond to
 * the new value." The grid recreated on reveal should therefore raise `gridReady` on the current prop, so handler B
 * is called once and handler A stays at the one call from the initial mount.
 *
 * Actual: handler A is called a second time when the grid is recreated and handler B is never called.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of React grid lifecycle events for AG-18665.
 */
// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('React Suspense reveal', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule]);
    });

    afterEach(() => {
        cleanup();
    });

    const columnDefs: ColDef<{ a: string }>[] = [{ field: 'a' }];
    const rowData = [{ a: 'x' }];

    test('grid recreated after Suspense reveal calls the current onGridReady prop', async () => {
        const handlerA = vitest.fn();
        const handlerB = vitest.fn();
        let resolveSuspense: (() => void) | null = null;

        const SuspendingChild = ({ promise }: { promise: Promise<void> | null }) => {
            if (promise) {
                throw promise;
            }
            return null;
        };

        const Wrapper = () => {
            const [version, setVersion] = useState(1);
            const [promise, setPromise] = useState<Promise<void> | null>(null);
            return (
                <div>
                    <button type="button" onClick={() => setVersion(2)}>
                        swap-handler
                    </button>
                    <button
                        type="button"
                        onClick={() => setPromise(new Promise<void>((resolve) => (resolveSuspense = resolve)))}
                    >
                        trigger-suspense
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            resolveSuspense?.();
                            setPromise(null);
                        }}
                    >
                        resolve-suspense
                    </button>
                    <Suspense fallback={<span>loading...</span>}>
                        <SuspendingChild promise={promise} />
                        <div style={{ height: 300, width: 400 }}>
                            <AgGridReact
                                columnDefs={columnDefs}
                                rowData={rowData}
                                onGridReady={version === 1 ? handlerA : handlerB}
                            />
                        </div>
                    </Suspense>
                </div>
            );
        };

        render(<Wrapper />);
        await waitFor(() => expect(handlerA).toHaveBeenCalledTimes(1));

        act(() => {
            screen.getByText('swap-handler').click();
        });
        act(() => {
            screen.getByText('trigger-suspense').click();
        });
        await screen.findByText('loading...');

        act(() => {
            screen.getByText('resolve-suspense').click();
        });
        await waitFor(() => expect(screen.queryByText('loading...')).toBeNull());

        await waitFor(() => expect(handlerB).toHaveBeenCalledTimes(1));
        expect(handlerA).toHaveBeenCalledTimes(1);
    });
});
