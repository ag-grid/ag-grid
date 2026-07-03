import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React, { Suspense, act, useMemo, useState } from 'react';

import type { ColDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ModuleRegistry, RowApiModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

describe('React Suspense', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnApiModule, RowApiModule]);
    });

    beforeEach(() => {
        cleanup();
    });

    test('Should suspend with no error', async () => {
        let didSuspend = false;
        interface InnerComponentProps {
            rowData: { item: string }[];
            setRowData: React.Dispatch<React.SetStateAction<{ item: string }[]>>;
        }
        const InnerComponent = (props: InnerComponentProps) => {
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

    test('Should maintain pinned columns after Suspense unmount/remount with columnDefs change', async () => {
        let gridApi: GridApi | null = null;
        let resolveSuspense: (() => void) | null = null;

        const rowData = [
            { id: 1, name: 'Row A', value: 'Value A' },
            { id: 2, name: 'Row B', value: 'Value B' },
        ];

        const GridComponent = ({ lang, onReady }: { lang: 'en' | 'fr'; onReady: (api: GridApi) => void }) => {
            const columnDefs = useMemo<ColDef[]>(
                () => [
                    { field: 'name', pinned: 'left', width: 200 },
                    { field: 'value', headerName: lang === 'fr' ? 'Valeur' : 'Value', flex: 1 },
                ],
                [lang]
            );
            return (
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    onGridReady={({ api }: { api: GridApi }) => onReady(api)}
                />
            );
        };

        const SuspendingWrapper = ({
            suspendPromise,
            lang,
            onReady,
        }: {
            suspendPromise: Promise<void> | null;
            lang: 'en' | 'fr';
            onReady: (api: GridApi) => void;
        }) => {
            if (suspendPromise) {
                throw suspendPromise;
            }
            return <GridComponent lang={lang} onReady={onReady} />;
        };

        const Wrapper = () => {
            const [lang, setLang] = useState<'en' | 'fr'>('en');
            const [suspendPromise, setSuspendPromise] = useState<Promise<void> | null>(null);

            return (
                <div>
                    <button
                        type="button"
                        onClick={() => {
                            const promise = new Promise<void>((resolve) => {
                                resolveSuspense = resolve;
                            });
                            setSuspendPromise(promise);
                        }}
                    >
                        trigger-suspense
                    </button>
                    <button type="button" onClick={() => setLang('fr')}>
                        change-lang
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            resolveSuspense?.();
                            setSuspendPromise(null);
                        }}
                    >
                        resolve-suspense
                    </button>
                    <Suspense fallback={<span>loading...</span>}>
                        <SuspendingWrapper
                            suspendPromise={suspendPromise}
                            lang={lang}
                            onReady={(api) => {
                                gridApi = api;
                            }}
                        />
                    </Suspense>
                </div>
            );
        };

        const { getByText } = render(<Wrapper />);

        // Wait for the grid to be ready
        await waitFor(() => expect(gridApi).not.toBeNull());

        // Verify pinned column exists on initial render
        const initialColState = gridApi!.getColumnState();
        expect(initialColState.find((s) => s.colId === 'name')?.pinned).toBe('left');

        // Step 1: Trigger suspense to unmount the grid
        act(() => {
            getByText('trigger-suspense').click();
        });

        await screen.findByText('loading...');
        gridApi = null;

        // Step 2: Change language while grid is suspended (this changes columnDefs)
        act(() => {
            getByText('change-lang').click();
        });

        // Step 3: Resolve suspense to remount the grid with new columnDefs
        act(() => {
            getByText('resolve-suspense').click();
        });

        // Wait for the grid to be ready after remount
        await waitFor(() => expect(gridApi).not.toBeNull());

        // The pinned column should still be pinned after Suspense remount with changed columnDefs
        const colStateAfterRemount = gridApi!.getColumnState();
        expect(colStateAfterRemount.find((s) => s.colId === 'name')?.pinned).toBe('left');

        // The column should be rendered in the left (pinned) display area
        const leftCols = gridApi!.getDisplayedLeftColumns();
        expect(leftCols).toHaveLength(1);
        expect(leftCols[0].getColId()).toBe('name');
    });

    test('Should maintain pinned columns after Suspense unmount/remount with no prop changes', async () => {
        let gridApi: GridApi | null = null;
        let resolveSuspense: (() => void) | null = null;

        const rowData = [
            { id: 1, name: 'Row A', value: 'Value A' },
            { id: 2, name: 'Row B', value: 'Value B' },
        ];

        const columnDefs: ColDef[] = [
            { field: 'name', pinned: 'left', width: 200 },
            { field: 'value', flex: 1 },
        ];

        const SuspendingWrapper = ({
            suspendPromise,
            onReady,
        }: {
            suspendPromise: Promise<void> | null;
            onReady: (api: GridApi) => void;
        }) => {
            if (suspendPromise) {
                throw suspendPromise;
            }
            return (
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    onGridReady={({ api }: { api: GridApi }) => onReady(api)}
                />
            );
        };

        const Wrapper = () => {
            const [suspendPromise, setSuspendPromise] = useState<Promise<void> | null>(null);

            return (
                <div>
                    <button
                        type="button"
                        onClick={() => {
                            const promise = new Promise<void>((resolve) => {
                                resolveSuspense = resolve;
                            });
                            setSuspendPromise(promise);
                        }}
                    >
                        trigger-suspense
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            resolveSuspense?.();
                            setSuspendPromise(null);
                        }}
                    >
                        resolve-suspense
                    </button>
                    <Suspense fallback={<span>loading...</span>}>
                        <SuspendingWrapper
                            suspendPromise={suspendPromise}
                            onReady={(api) => {
                                gridApi = api;
                            }}
                        />
                    </Suspense>
                </div>
            );
        };

        const { getByText } = render(<Wrapper />);

        await waitFor(() => expect(gridApi).not.toBeNull());
        expect(gridApi!.getColumnState().find((s) => s.colId === 'name')?.pinned).toBe('left');

        // Trigger suspense to unmount the grid
        act(() => {
            getByText('trigger-suspense').click();
        });

        await screen.findByText('loading...');
        gridApi = null;

        // Resolve suspense with no prop changes
        act(() => {
            getByText('resolve-suspense').click();
        });

        await waitFor(() => expect(gridApi).not.toBeNull());

        // Pinned column should still be intact after unmount/remount with no prop changes
        expect(gridApi!.getColumnState().find((s) => s.colId === 'name')?.pinned).toBe('left');
        const leftCols = gridApi!.getDisplayedLeftColumns();
        expect(leftCols).toHaveLength(1);
        expect(leftCols[0].getColId()).toBe('name');
    });

    test('Should apply rowData change made during Suspense suspension', async () => {
        let gridApi: GridApi | null = null;
        let resolveSuspense: (() => void) | null = null;

        const initialRowData = [
            { id: 1, name: 'Row A' },
            { id: 2, name: 'Row B' },
        ];
        const updatedRowData = [
            { id: 1, name: 'Row A' },
            { id: 2, name: 'Row B' },
            { id: 3, name: 'Row C' },
        ];

        const SuspendingWrapper = ({
            suspendPromise,
            rowData,
            onReady,
        }: {
            suspendPromise: Promise<void> | null;
            rowData: { id: number; name: string }[];
            onReady: (api: GridApi) => void;
        }) => {
            if (suspendPromise) {
                throw suspendPromise;
            }
            return (
                <AgGridReact
                    rowData={rowData}
                    columnDefs={[{ field: 'name' }]}
                    getRowId={({ data }) => String(data.id)}
                    onGridReady={({ api }: { api: GridApi }) => onReady(api)}
                />
            );
        };

        const Wrapper = () => {
            const [rowData, setRowData] = useState(initialRowData);
            const [suspendPromise, setSuspendPromise] = useState<Promise<void> | null>(null);

            return (
                <div>
                    <button
                        type="button"
                        onClick={() => {
                            const promise = new Promise<void>((resolve) => {
                                resolveSuspense = resolve;
                            });
                            setSuspendPromise(promise);
                        }}
                    >
                        trigger-suspense
                    </button>
                    <button type="button" onClick={() => setRowData(updatedRowData)}>
                        add-row
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            resolveSuspense?.();
                            setSuspendPromise(null);
                        }}
                    >
                        resolve-suspense
                    </button>
                    <Suspense fallback={<span>loading...</span>}>
                        <SuspendingWrapper
                            suspendPromise={suspendPromise}
                            rowData={rowData}
                            onReady={(api) => {
                                gridApi = api;
                            }}
                        />
                    </Suspense>
                </div>
            );
        };

        const { getByText } = render(<Wrapper />);

        await waitFor(() => expect(gridApi).not.toBeNull());
        expect(gridApi!.getDisplayedRowCount()).toBe(2);

        // Trigger suspense to unmount the grid
        act(() => {
            getByText('trigger-suspense').click();
        });

        await screen.findByText('loading...');
        gridApi = null;

        // Add a row while grid is suspended
        act(() => {
            getByText('add-row').click();
        });

        // Resolve suspense to remount the grid
        act(() => {
            getByText('resolve-suspense').click();
        });

        await waitFor(() => expect(gridApi).not.toBeNull());

        // The new row should be present after remount
        expect(gridApi!.getDisplayedRowCount()).toBe(3);
        expect(gridApi!.getDisplayedRowAtIndex(2)!.data.name).toBe('Row C');
    });

    test('Should handle multiple Suspense cycles correctly', async () => {
        let gridApi: GridApi | null = null;
        let resolveSuspense: (() => void) | null = null;

        const SuspendingWrapper = ({
            suspendPromise,
            label,
            onReady,
        }: {
            suspendPromise: Promise<void> | null;
            label: string;
            onReady: (api: GridApi) => void;
        }) => {
            if (suspendPromise) {
                throw suspendPromise;
            }
            return (
                <AgGridReact
                    rowData={[{ value: label }]}
                    columnDefs={[{ field: 'value', pinned: 'left' }]}
                    onGridReady={({ api }: { api: GridApi }) => onReady(api)}
                />
            );
        };

        const Wrapper = () => {
            const [label, setLabel] = useState('initial');
            const [suspendPromise, setSuspendPromise] = useState<Promise<void> | null>(null);

            return (
                <div>
                    <button
                        type="button"
                        onClick={() => {
                            const promise = new Promise<void>((resolve) => {
                                resolveSuspense = resolve;
                            });
                            setSuspendPromise(promise);
                        }}
                    >
                        trigger-suspense
                    </button>
                    <button type="button" onClick={() => setLabel((l) => l + '-updated')}>
                        update-label
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            resolveSuspense?.();
                            setSuspendPromise(null);
                        }}
                    >
                        resolve-suspense
                    </button>
                    <Suspense fallback={<span>loading...</span>}>
                        <SuspendingWrapper
                            suspendPromise={suspendPromise}
                            label={label}
                            onReady={(api) => {
                                gridApi = api;
                            }}
                        />
                    </Suspense>
                </div>
            );
        };

        const { getByText } = render(<Wrapper />);
        await waitFor(() => expect(gridApi).not.toBeNull());
        expect(gridApi!.getColumnState().find((s) => s.colId === 'value')?.pinned).toBe('left');

        // --- First Suspense cycle ---
        act(() => {
            getByText('trigger-suspense').click();
        });
        await screen.findByText('loading...');
        gridApi = null;

        act(() => {
            getByText('update-label').click();
        });
        act(() => {
            getByText('resolve-suspense').click();
        });

        await waitFor(() => expect(gridApi).not.toBeNull());
        expect(gridApi!.getColumnState().find((s) => s.colId === 'value')?.pinned).toBe('left');
        gridApi = null;

        // --- Second Suspense cycle ---
        act(() => {
            getByText('trigger-suspense').click();
        });
        await screen.findByText('loading...');

        act(() => {
            getByText('update-label').click();
        });
        act(() => {
            getByText('resolve-suspense').click();
        });

        await waitFor(() => expect(gridApi).not.toBeNull());

        // Pinned column intact after second cycle
        expect(gridApi!.getColumnState().find((s) => s.colId === 'value')?.pinned).toBe('left');
    });

    test('Should apply multiple prop changes made during Suspense suspension', async () => {
        let gridApi: GridApi | null = null;
        let resolveSuspense: (() => void) | null = null;

        const initialRowData = [{ id: 1, name: 'Row A', value: 'Value A' }];
        const updatedRowData = [
            { id: 1, name: 'Row A', value: 'Value A' },
            { id: 2, name: 'Row B', value: 'Value B' },
        ];

        const SuspendingWrapper = ({
            suspendPromise,
            rowData,
            lang,
            onReady,
        }: {
            suspendPromise: Promise<void> | null;
            rowData: { id: number; name: string; value: string }[];
            lang: 'en' | 'fr';
            onReady: (api: GridApi) => void;
        }) => {
            if (suspendPromise) {
                throw suspendPromise;
            }
            const columnDefs = useMemo<ColDef[]>(
                () => [
                    { field: 'name', pinned: 'left', width: 200 },
                    { field: 'value', headerName: lang === 'fr' ? 'Valeur' : 'Value', flex: 1 },
                ],
                [lang]
            );
            return (
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    getRowId={({ data }) => String(data.id)}
                    onGridReady={({ api }: { api: GridApi }) => onReady(api)}
                />
            );
        };

        const Wrapper = () => {
            const [lang, setLang] = useState<'en' | 'fr'>('en');
            const [rowData, setRowData] = useState(initialRowData);
            const [suspendPromise, setSuspendPromise] = useState<Promise<void> | null>(null);

            return (
                <div>
                    <button
                        type="button"
                        onClick={() => {
                            const promise = new Promise<void>((resolve) => {
                                resolveSuspense = resolve;
                            });
                            setSuspendPromise(promise);
                        }}
                    >
                        trigger-suspense
                    </button>
                    <button type="button" onClick={() => setLang('fr')}>
                        change-lang
                    </button>
                    <button type="button" onClick={() => setRowData(updatedRowData)}>
                        add-row
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            resolveSuspense?.();
                            setSuspendPromise(null);
                        }}
                    >
                        resolve-suspense
                    </button>
                    <Suspense fallback={<span>loading...</span>}>
                        <SuspendingWrapper
                            suspendPromise={suspendPromise}
                            rowData={rowData}
                            lang={lang}
                            onReady={(api) => {
                                gridApi = api;
                            }}
                        />
                    </Suspense>
                </div>
            );
        };

        const { getByText } = render(<Wrapper />);
        await waitFor(() => expect(gridApi).not.toBeNull());
        expect(gridApi!.getDisplayedRowCount()).toBe(1);
        expect(gridApi!.getColumnState().find((s) => s.colId === 'name')?.pinned).toBe('left');

        // Trigger suspense
        act(() => {
            getByText('trigger-suspense').click();
        });
        await screen.findByText('loading...');
        gridApi = null;

        // Change both columnDefs (via lang) and rowData while suspended
        act(() => {
            getByText('change-lang').click();
        });
        act(() => {
            getByText('add-row').click();
        });

        // Resolve suspense
        act(() => {
            getByText('resolve-suspense').click();
        });

        await waitFor(() => expect(gridApi).not.toBeNull());

        // Both prop changes should be reflected after remount
        expect(gridApi!.getDisplayedRowCount()).toBe(2);
        expect(gridApi!.getColumnState().find((s) => s.colId === 'name')?.pinned).toBe('left');
        expect(gridApi!.getColumn('value')!.getColDef().headerName).toBe('Valeur');
    });
});
