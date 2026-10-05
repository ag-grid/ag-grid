import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React from 'react';

import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

// React renders the grid viewport itself, so its one scroll event serving both axes needs its own cover.
describe('fake scrollbars in React', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule]);
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    const renderScrollGrid = async () => {
        const rendered = render(
            <AgGridReact
                columnDefs={Array.from({ length: 10 }, (_, i) => ({ colId: `c${i}`, width: 300 }))}
                rowData={Array.from({ length: 200 }, () => ({}))}
            />
        );
        const find = (selector: string) => rendered.container.querySelector<HTMLElement>(selector);
        await waitFor(() => expect(find('.ag-body-horizontal-scroll-viewport')).not.toBeNull());
        const scroll = (selector: string, axis: 'scrollTop' | 'scrollLeft', value: number) => {
            const element = find(selector)!;
            element[axis] = value;
            element.dispatchEvent(new Event('scroll'));
        };
        return { viewport: find('.ag-grid-viewport')!, scroll };
    };

    test('the vertical scrollbar scrolls the rows straight after a horizontal scroll of the viewport', async () => {
        const { viewport, scroll } = await renderScrollGrid();
        scroll('.ag-grid-viewport', 'scrollLeft', 30);
        scroll('.ag-body-vertical-scroll-viewport', 'scrollTop', 100);
        expect(viewport.scrollTop).toBe(100);
    });

    test('the horizontal scrollbar scrolls the columns straight after a vertical scroll of the viewport', async () => {
        const { viewport, scroll } = await renderScrollGrid();
        scroll('.ag-grid-viewport', 'scrollTop', 100);
        scroll('.ag-body-horizontal-scroll-viewport', 'scrollLeft', 30);
        expect(viewport.scrollLeft).toBe(30);
    });
});
