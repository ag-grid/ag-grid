import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { useEffect, useState } from 'react';

import type { ColDef, IHeaderParams } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

let headerMountCount = 0;
let headerUnmountCount = 0;
let innerMountCount = 0;
let innerUnmountCount = 0;

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

describe('React header component lifecycle', () => {
    beforeEach(() => {
        cleanup();
        headerMountCount = 0;
        headerUnmountCount = 0;
        innerMountCount = 0;
        innerUnmountCount = 0;
        RejectingInnerHeader.reset();
    });

    it('headerComponent and innerHeaderComponent are both re-rendered rather than remounted when column defs are updated', async () => {
        render(<GridApp defs={columnDefs} />);

        // PortalManager mounts via setTimeout batching, so wait for initial mount
        await waitFor(() => {
            expect(headerMountCount).toBe(1);
            expect(innerMountCount).toBe(1);
        });
        expect(headerUnmountCount).toBe(0);
        expect(innerUnmountCount).toBe(0);

        fireEvent.click(screen.getByRole('button', { name: 'Update Cols' }));

        // Flush any pending portal updates — PortalManager batches via setTimeout, so a
        // resolved setTimeout scheduled after the click will run after those callbacks.
        await act(async () => {
            await new Promise<void>((resolve) => setTimeout(resolve));
        });

        expect(headerMountCount).toBe(1);
        expect(headerUnmountCount).toBe(0);
        expect(innerMountCount).toBe(1);
        expect(innerUnmountCount).toBe(0);
    });

    it('innerHeaderComponent is remounted when its refresh returns false, outer headerComp stays alive', async () => {
        render(<GridApp defs={rejectingColumnDefs} />);

        // Wait for the React headerComponent portal to mount
        await waitFor(() => expect(headerMountCount).toBe(1));
        expect(RejectingInnerHeader.initCount).toBe(1);
        expect(RejectingInnerHeader.destroyCount).toBe(0);

        fireEvent.click(screen.getByRole('button', { name: 'Update Cols' }));

        // RejectingInnerHeader lifecycle is synchronous (vanilla JS, no portal), so counts
        // are available immediately. Flush setTimeout for the portal-based CustomHeader.
        await act(async () => {
            await new Promise<void>((resolve) => setTimeout(resolve));
        });

        // Inner component signalled it cannot handle the update — it should be replaced
        expect(RejectingInnerHeader.refreshCount).toBe(1);
        expect(RejectingInnerHeader.destroyCount).toBe(1);
        expect(RejectingInnerHeader.initCount).toBe(2);

        // Outer headerComp (CustomHeader on the adjacent column) must not have been remounted
        expect(headerMountCount).toBe(1);
        expect(headerUnmountCount).toBe(0);
    });
});
