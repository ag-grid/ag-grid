import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

import type { ColDef, IHeaderParams } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

// PortalManager batches React renders via setTimeout. Awaiting one event-loop turn
// ensures all pending portal mounts/unmounts and downstream promise resolutions settle.
const flushPortalUpdates = () =>
    act(async () => {
        await new Promise<void>((resolve) => setTimeout(resolve));
    });

let headerMountCount = 0;
let headerUnmountCount = 0;
let innerMountCount = 0;
let innerUnmountCount = 0;
let innerMountCount2 = 0;
let innerUnmountCount2 = 0;
let lastInnerDisplayName: string | undefined;
let lastCustomLabel: string | undefined;

const CustomHeader = () => {
    useEffect(() => {
        headerMountCount++;
        return () => {
            headerUnmountCount++;
        };
    }, []);
    return <div className="custom-header">header</div>;
};

const CustomInnerHeader = () => {
    useEffect(() => {
        innerMountCount++;
        return () => {
            innerUnmountCount++;
        };
    }, []);
    return <span className="custom-inner-header">inner</span>;
};

const CustomLabelInnerHeader = (params: IHeaderParams & { customLabel: string }) => {
    lastCustomLabel = params.customLabel;
    return <span className="custom-label">{params.customLabel}</span>;
};

const PropsCapturingInnerHeader = ({ displayName }: IHeaderParams) => {
    lastInnerDisplayName = displayName;
    return <span className="props-capturing">{displayName}</span>;
};

const CustomInnerHeader2 = ({ displayName }: IHeaderParams) => {
    const [count, setCount] = React.useState(0);

    useEffect(() => {
        innerMountCount2++;
        const interval = setInterval(() => setCount((prev) => prev + 1), 1000);
        return () => {
            innerUnmountCount2++;
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="custom-inner-header-2">
            <span>{displayName}</span>
            <span>{count}</span>
        </div>
    );
};

// Vanilla JS inner header component that signals it cannot handle a refresh.
// Used to verify that only the inner component is remounted, not the outer HeaderComp.
class RejectingInnerHeader {
    static initCount = 0;
    static destroyCount = 0;
    static refreshCount = 0;

    static reset(): void {
        RejectingInnerHeader.initCount = 0;
        RejectingInnerHeader.destroyCount = 0;
        RejectingInnerHeader.refreshCount = 0;
    }

    private gui = document.createElement('span');

    init(_params: IHeaderParams): void {
        RejectingInnerHeader.initCount++;
        this.gui = document.createElement('span');
    }

    refresh(_params: IHeaderParams): boolean {
        RejectingInnerHeader.refreshCount++;
        return false;
    }

    getGui(): HTMLElement {
        return this.gui;
    }

    destroy(): void {
        RejectingInnerHeader.destroyCount++;
    }
}

const columnDefs: ColDef[] = [
    { field: 'a', headerComponent: CustomHeader },
    { field: 'b', sortable: false, headerComponentParams: { innerHeaderComponent: CustomInnerHeader } },
];

const rejectingColumnDefs: ColDef[] = [
    { field: 'a', headerComponent: CustomHeader },
    { field: 'b', sortable: false, headerComponentParams: { innerHeaderComponent: RejectingInnerHeader } },
];

const rowData = [{ a: 1, b: 10 }];

const GridApp = ({ defs }: { defs: ColDef[] }) => {
    const [cols, setCols] = useState<ColDef[]>(defs);
    return (
        <>
            <button onClick={() => setCols([...defs])}>Update Cols</button>
            <AgGridReact rowData={rowData} columnDefs={cols} modules={[AllCommunityModule]} />
        </>
    );
};

const SwitchingGridApp = ({ defs1, defs2 }: { defs1: ColDef[]; defs2: ColDef[] }) => {
    const [cols, setCols] = useState<ColDef[]>(defs1);
    return (
        <>
            <button onClick={() => setCols(defs2)}>Switch Cols</button>
            <AgGridReact rowData={rowData} columnDefs={cols} modules={[AllCommunityModule]} />
        </>
    );
};

describe('React header component lifecycle', () => {
    beforeEach(() => {
        cleanup();
        headerMountCount = 0;
        headerUnmountCount = 0;
        innerMountCount = 0;
        innerUnmountCount = 0;
        innerMountCount2 = 0;
        innerUnmountCount2 = 0;
        lastInnerDisplayName = undefined;
        lastCustomLabel = undefined;
        RejectingInnerHeader.reset();
    });

    it('stale in-flight innerHeaderComponent is destroyed if column defs update before the portal renders', async () => {
        const { container } = render(<GridApp defs={columnDefs} />);

        // Click before the portal renders — the gen-1 creation is in-flight.
        // Both portals end up rendering in the same batch, but the gen-1 instance must be
        // destroyed so exactly one component remains alive.
        fireEvent.click(screen.getByRole('button', { name: 'Update Cols' }));
        await flushPortalUpdates();

        expect(innerMountCount - innerUnmountCount).toBe(1);
        expect(container.querySelector('.custom-inner-header')?.textContent).toBe('inner');
    });

    it('headerComponent and innerHeaderComponent are both re-rendered rather than remounted when column defs are updated', async () => {
        const { container } = render(<GridApp defs={columnDefs} />);

        await waitFor(() => {
            expect(headerMountCount).toBe(1);
            expect(innerMountCount).toBe(1);
        });
        expect(headerUnmountCount).toBe(0);
        expect(innerUnmountCount).toBe(0);
        expect(container.querySelector('.custom-inner-header')?.textContent).toBe('inner');

        fireEvent.click(screen.getByRole('button', { name: 'Update Cols' }));
        await flushPortalUpdates();

        expect(headerMountCount).toBe(1);
        expect(headerUnmountCount).toBe(0);
        expect(innerMountCount).toBe(1);
        expect(innerUnmountCount).toBe(0);
        expect(container.querySelector('.custom-inner-header')?.textContent).toBe('inner');
    });

    it('innerHeaderComponent is remounted when its refresh returns false, outer headerComp stays alive', async () => {
        render(<GridApp defs={rejectingColumnDefs} />);

        await waitFor(() => expect(headerMountCount).toBe(1));
        expect(RejectingInnerHeader.initCount).toBe(1);
        expect(RejectingInnerHeader.destroyCount).toBe(0);

        fireEvent.click(screen.getByRole('button', { name: 'Update Cols' }));
        // RejectingInnerHeader is vanilla JS (synchronous), but CustomHeader uses a portal.
        await flushPortalUpdates();

        // Inner component signalled it cannot handle the update — it should be replaced
        expect(RejectingInnerHeader.refreshCount).toBe(1);
        expect(RejectingInnerHeader.destroyCount).toBe(1);
        expect(RejectingInnerHeader.initCount).toBe(2);

        // Outer headerComp (CustomHeader on the adjacent column) must not have been remounted
        expect(headerMountCount).toBe(1);
        expect(headerUnmountCount).toBe(0);
    });

    it('innerHeaderComponent is replaced when the configured component class changes', async () => {
        const defs1: ColDef[] = [
            { field: 'b', sortable: false, headerComponentParams: { innerHeaderComponent: CustomInnerHeader } },
        ];
        const defs2: ColDef[] = [
            { field: 'b', sortable: false, headerComponentParams: { innerHeaderComponent: CustomInnerHeader2 } },
        ];

        const { container } = render(<SwitchingGridApp defs1={defs1} defs2={defs2} />);

        await waitFor(() => expect(innerMountCount).toBe(1));
        expect(innerMountCount2).toBe(0);
        expect(container.querySelector('.custom-inner-header')?.textContent).toBe('inner');
        expect(container.querySelector('.custom-inner-header-2')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Switch Cols' }));

        await flushPortalUpdates();

        // Old component should be unmounted and the new component mounted in its place
        expect(innerUnmountCount).toBe(1);
        expect(innerMountCount2).toBe(1);
        expect(innerUnmountCount2).toBe(0);
        expect(container.querySelector('.custom-inner-header')).toBeNull();
        expect(container.querySelector('.custom-inner-header-2')).not.toBeNull();
    });

    it('innerHeaderComponent re-renders with updated props when column def changes', async () => {
        const defs1: ColDef[] = [
            {
                field: 'b',
                headerName: 'Before',
                sortable: false,
                headerComponentParams: { innerHeaderComponent: PropsCapturingInnerHeader },
            },
        ];
        const defs2: ColDef[] = [
            {
                field: 'b',
                headerName: 'After',
                sortable: false,
                headerComponentParams: { innerHeaderComponent: PropsCapturingInnerHeader },
            },
        ];

        const { container } = render(<SwitchingGridApp defs1={defs1} defs2={defs2} />);

        await waitFor(() => expect(lastInnerDisplayName).toBe('Before'));
        expect(container.querySelector('.props-capturing')?.textContent).toBe('Before');

        fireEvent.click(screen.getByRole('button', { name: 'Switch Cols' }));

        await flushPortalUpdates();

        expect(lastInnerDisplayName).toBe('After');
        expect(container.querySelector('.props-capturing')?.textContent).toBe('After');
    });

    it('innerHeaderComponent re-renders with updated innerHeaderComponentParams', async () => {
        const defs1: ColDef[] = [
            {
                field: 'b',
                sortable: false,
                headerComponentParams: {
                    innerHeaderComponent: CustomLabelInnerHeader,
                    innerHeaderComponentParams: { customLabel: 'Before' },
                },
            },
        ];
        const defs2: ColDef[] = [
            {
                field: 'b',
                sortable: false,
                headerComponentParams: {
                    innerHeaderComponent: CustomLabelInnerHeader,
                    innerHeaderComponentParams: { customLabel: 'After' },
                },
            },
        ];

        const { container } = render(<SwitchingGridApp defs1={defs1} defs2={defs2} />);

        await waitFor(() => expect(lastCustomLabel).toBe('Before'));
        expect(container.querySelector('.custom-label')?.textContent).toBe('Before');

        fireEvent.click(screen.getByRole('button', { name: 'Switch Cols' }));

        await flushPortalUpdates();

        expect(lastCustomLabel).toBe('After');
        expect(container.querySelector('.custom-label')?.textContent).toBe('After');
    });

    it('removing innerHeaderComponent restores display name text in the header cell', async () => {
        const defs1: ColDef[] = [
            {
                field: 'b',
                headerName: 'My Header',
                sortable: false,
                headerComponentParams: { innerHeaderComponent: CustomInnerHeader },
            },
        ];
        const defs2: ColDef[] = [{ field: 'b', headerName: 'My Header', sortable: false }];

        const { container } = render(<SwitchingGridApp defs1={defs1} defs2={defs2} />);

        await waitFor(() => expect(innerMountCount).toBe(1));
        expect(container.querySelector('.custom-inner-header')?.textContent).toBe('inner');

        fireEvent.click(screen.getByRole('button', { name: 'Switch Cols' }));

        await flushPortalUpdates();

        expect(innerUnmountCount).toBe(1);
        expect(container.querySelector('.custom-inner-header')).toBeNull();
        expect(container.querySelector('.ag-header-cell-text')?.textContent).toBe('My Header');
    });
});
