import { ignoreConsoleLicenseKeyError } from 'ag-test-utils/ignoreKnownNoise';
import React from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import type { GridApi, GridReadyEvent } from 'ag-grid-community';
import type { AgGridReactProps } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react';

import { benchCooldown } from './bench-utils';

// Every grid, so a bench's reset also unmounts the one another suite of its file left behind.
const grids = new Set<ReactBenchGrid<unknown>>();

/** One AgGridReact in a viewport-filling container, like BenchGridsManager's grids; `reset()` unmounts them all. */
export class ReactBenchGrid<TData> {
    private root: Root | undefined;
    public container: HTMLDivElement | undefined;
    public api!: GridApi<TData>;

    public constructor() {
        grids.add(this);
    }

    /** Resolves once the grid is ready. */
    public async mount(props: Omit<AgGridReactProps<TData>, 'onGridReady'>): Promise<void> {
        const container = document.createElement('div');
        const style = container.style;
        style.width = '100vw';
        style.height = '100vh';
        document.body.style.margin = '0';
        document.body.appendChild(container);
        this.container = container;

        ignoreConsoleLicenseKeyError();

        const root = createRoot(container);
        this.root = root;
        await new Promise<void>((resolve) => {
            root.render(
                <AgGridReact<TData>
                    {...props}
                    onGridReady={(e: GridReadyEvent<TData>) => {
                        this.api = e.api;
                        resolve();
                    }}
                />
            );
        });
    }

    public async reset(): Promise<void> {
        for (const grid of grids) {
            grid.unmount();
        }
        await benchCooldown();
    }

    private unmount(): void {
        this.root?.unmount();
        this.container?.remove();
        this.root = undefined;
        this.container = undefined;
        this.api = undefined!;
    }
}
