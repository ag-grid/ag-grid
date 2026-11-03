import { waitFor } from '@testing-library/dom';
import { act, cleanup, render } from '@testing-library/react';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { installMockResizeObserver, triggerResizeObservers } from 'ag-test-utils/polyfills/mockResizeObserver';
import React, { useEffect, useState } from 'react';

import { ClientSideRowModelModule, ModuleRegistry, RowApiModule, RowAutoHeightModule } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

/**
 * Issue: with `detailRowAutoHeight` in React, a custom detail cell renderer that loads its data before rendering
 * is not resized to its content if its root element changes once the data arrives. `rowComp.tsx` only ever measures
 * the anchor's first child as it was when the row mounted: it polls for it a few render passes, then attaches a
 * resize observer to whatever it found. A renderer that returns `null` while loading is never measured at all, and
 * one that returns a loading placeholder is measured through the placeholder, which React then replaces.
 *
 * Setup: `<AgGridReact masterDetail detailRowAutoHeight detailCellRenderer={...} />` where the renderer fetches its
 * data in `useEffect` (a fake 50ms fetch) and then renders a 500px tall element. The first row is expanded, and once
 * the content is shown every resize observer is fired, as a browser would after a layout change. Two common loading
 * patterns are tested: `if (!data) return null;` and `if (!data) return <p>Loading...</p>;`. A control renders the
 * loading text inside the same root element it later fills with content.
 *
 * Expected: the Master / Detail docs say "set `detailRowAutoHeight: true` in the master-level gridOptions and
 * ensure the content nested inside the detail cell renderer component sets a height value", so once the content has
 * loaded the detail row height should be about 500px.
 *
 * Actual: the control passes. With `return null` the detail row stays at the 1px it starts at under auto height, so
 * it is effectively hidden; with a placeholder it stays at the placeholder's height (31px).
 *
 * Reported on: AG Grid React 35.0.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665).
 * Five searches in March 2026 (React 35.0.0) about custom detail cell renderers with overflow, clipped content and
 * the detail row height being wrong, e.g. "master detail row height cut off not showing all rows".
 */
describe('React detailRowAutoHeight with a detail renderer that loads data before rendering', () => {
    const CONTENT_HEIGHT = 500;
    const LOADING_HEIGHT = 30;
    let uninstallResizeObserver: () => void;

    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelModule,
            RowApiModule,
            RowAutoHeightModule,
            MasterDetailModule,
        ]);
        mockGridLayout.init();
        mockGridLayout.useRealOffsetDimensions = true;
        mockGridLayout.elementHeightOverride = (el) => {
            if (!el.isConnected) {
                return 0;
            }
            if (el.classList.contains('test-detail-content')) {
                return CONTENT_HEIGHT;
            }
            if (el.classList.contains('test-detail-loading')) {
                return LOADING_HEIGHT;
            }
            if (el.classList.contains('test-detail-root')) {
                return el.querySelector('.test-detail-content') ? CONTENT_HEIGHT : LOADING_HEIGHT;
            }
            return undefined;
        };
    });

    afterAll(() => {
        mockGridLayout.resetOptions();
    });

    beforeEach(() => {
        uninstallResizeObserver = installMockResizeObserver();
    });

    afterEach(() => {
        cleanup();
        uninstallResizeObserver();
    });

    const fakeFetch = () => new Promise<string>((resolve) => setTimeout(() => resolve('detail content'), 50));

    const useDetailData = () => {
        const [data, setData] = useState<string>();
        useEffect(() => {
            fakeFetch().then(setData);
        }, []);
        return data;
    };

    const NullWhileLoading = () => {
        const data = useDetailData();
        if (!data) {
            return null;
        }
        return <div className="test-detail-content">{data}</div>;
    };

    const PlaceholderWhileLoading = () => {
        const data = useDetailData();
        if (!data) {
            return <p className="test-detail-loading">Loading...</p>;
        }
        return <div className="test-detail-content">{data}</div>;
    };

    const StableRootWhileLoading = () => {
        const data = useDetailData();
        return (
            <div className="test-detail-root">
                {data ? <div className="test-detail-content">{data}</div> : 'Loading...'}
            </div>
        );
    };

    const expectDetailRowSizedToContent = async (detailCellRenderer: React.ComponentType) => {
        let api: any;
        render(
            <div style={{ height: 800, width: 600 }}>
                <AgGridReact
                    columnDefs={[{ field: 'k' }]}
                    rowData={[{ k: '1' }]}
                    masterDetail
                    detailRowAutoHeight
                    detailCellRenderer={detailCellRenderer}
                    onGridReady={(e) => {
                        api = e.api;
                    }}
                />
            </div>
        );
        await waitFor(() => expect(api).toBeDefined());
        act(() => api.getDisplayedRowAtIndex(0).setExpanded(true));

        await waitFor(() => expect(document.querySelector('.test-detail-content')).not.toBeNull());
        act(() => triggerResizeObservers());

        await waitFor(() => expect(api.getDisplayedRowAtIndex(1)!.rowHeight).toBeGreaterThanOrEqual(CONTENT_HEIGHT));
    };

    test('control: renderer that keeps the same root element while loading is auto-sized', async () => {
        await expectDetailRowSizedToContent(StableRootWhileLoading);
    });

    test('renderer that returns null while loading is auto-sized', async () => {
        await expectDetailRowSizedToContent(NullWhileLoading);
    });

    test('renderer that returns a loading placeholder while loading is auto-sized', async () => {
        await expectDetailRowSizedToContent(PlaceholderWhileLoading);
    });
});
