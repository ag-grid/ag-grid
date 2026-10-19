import { act, cleanup, render, waitFor } from '@testing-library/react';
import { asyncSetTimeout } from 'ag-test-utils';
import React from 'react';

import type { ColDef, DomLayoutType } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

interface Row {
    a: string;
}

const COLUMN_DEFS: ColDef<Row>[] = [{ field: 'a' }];
const ROW_DATA: Row[] = [{ a: 'a1' }, { a: 'a2' }];

const LAYOUT_CLASSES: Record<DomLayoutType, string> = {
    normal: 'ag-layout-normal',
    autoHeight: 'ag-layout-auto-height',
    print: 'ag-layout-print',
};

/** Records every class the grid body root has had, including ones replaced before the test could look. */
function observeBodyRootClasses(container: HTMLElement): { classes: Set<string>; disconnect: () => void } {
    const classes = new Set<string>();
    const record = (el: Element) => {
        for (const cls of el.classList) {
            classes.add(cls);
        }
    };
    const observer = new MutationObserver((mutations) => {
        for (const { type, target, oldValue, addedNodes } of mutations) {
            if (type === 'attributes' && (target as Element).classList.contains('ag-root')) {
                oldValue?.split(' ').forEach((cls) => classes.add(cls));
                record(target as Element);
            }
            for (const node of addedNodes) {
                if (node instanceof Element) {
                    node.querySelectorAll('.ag-root').forEach(record);
                    if (node.classList.contains('ag-root')) {
                        record(node);
                    }
                }
            }
        }
    });
    observer.observe(container, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true,
    });
    return { classes, disconnect: () => observer.disconnect() };
}

// React commits GridBodyComp before LayoutFeature sets the layout class, so the first commit must already
// carry the right one: with autoHeight, a body briefly laid out as normal skips the autoHeightMaxBodyHeight
// cap, measures the full content height and renders every row.
describe('initial layout class in React', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule]);
    });

    afterEach(async () => {
        await act(async () => {
            await asyncSetTimeout(0);
            cleanup();
        });
    });

    test.each<DomLayoutType>(['autoHeight', 'print'])(
        'grid body never has another layout class with domLayout %s, on mount or remount',
        async (domLayout) => {
            const expectedClass = LAYOUT_CLASSES[domLayout];
            const container = document.createElement('div');
            document.body.appendChild(container);
            const { classes, disconnect } = observeBodyRootClasses(container);

            const renderGrid = (key: number) => (
                <AgGridReact<Row> key={key} rowData={ROW_DATA} columnDefs={COLUMN_DEFS} domLayout={domLayout} />
            );
            const rendered = render(renderGrid(1), { container });
            await waitFor(() => expect(rendered.container.querySelectorAll('[row-index]').length).toBeGreaterThan(0));

            rendered.rerender(renderGrid(2));
            await waitFor(() => expect(rendered.container.querySelectorAll('[row-index]').length).toBeGreaterThan(0));
            await act(async () => {
                await asyncSetTimeout(0);
            });
            disconnect();

            const layoutClassesSeen = [...classes].filter((cls) => cls.startsWith('ag-layout-'));
            expect(layoutClassesSeen).toEqual([expectedClass]);
        }
    );
});
