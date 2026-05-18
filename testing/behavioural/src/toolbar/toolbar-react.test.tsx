import { cleanup, render } from '@testing-library/react';
import React from 'react';

import { ClientSideRowModelModule, ModuleRegistry, RowSelectionModule, ValidationModule } from 'ag-grid-community';
import { ToolbarModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { ignoreConsoleLicenseKeyError } from '../test-utils';

describe('Toolbar (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowSelectionModule, ToolbarModule, ValidationModule]);
        ignoreConsoleLicenseKeyError();
    });

    afterEach(() => {
        cleanup();
    });

    test('renders toolbar element when toolbar option is provided', async () => {
        const rendered = render(
            <AgGridReact
                rowData={[{ name: 'Alice' }]}
                columnDefs={[{ field: 'name' }]}
                toolbar={{ items: [{ label: 'Test', action: () => {} }] }}
            />
        );

        await rendered.findByText('Alice');

        const container = rendered.container;
        const toolbar = container.querySelector('.ag-toolbar');
        expect(toolbar).not.toBeNull();
        expect(toolbar?.classList.contains('ag-hidden')).toBe(false);
    });

    test('hides toolbar when toolbar option is not provided', async () => {
        const rendered = render(<AgGridReact rowData={[{ name: 'Alice' }]} columnDefs={[{ field: 'name' }]} />);

        await rendered.findByText('Alice');

        const container = rendered.container;
        const toolbar = container.querySelector<HTMLElement>('.ag-toolbar');
        expect(toolbar?.classList.contains('ag-hidden')).toBe(true);
    });

    test('hides toolbar when items array is empty', async () => {
        const rendered = render(
            <AgGridReact rowData={[{ name: 'Alice' }]} columnDefs={[{ field: 'name' }]} toolbar={{ items: [] }} />
        );

        await rendered.findByText('Alice');

        const container = rendered.container;
        const toolbar = container.querySelector('.ag-toolbar');
        expect(toolbar?.classList.contains('ag-hidden')).toBe(true);
    });

    test('toolbar is positioned above grid body', async () => {
        const rendered = render(
            <AgGridReact
                rowData={[{ name: 'Alice' }]}
                columnDefs={[{ field: 'name' }]}
                toolbar={{ items: [{ label: 'Test', action: () => {} }] }}
            />
        );

        await rendered.findByText('Alice');

        const container = rendered.container;
        const rootWrapper = container.querySelector('.ag-root-wrapper');
        const children = Array.from(rootWrapper?.children ?? []);
        const toolbarIndex = children.findIndex((el) => el.classList.contains('ag-toolbar'));
        const bodyIndex = children.findIndex((el) => el.classList.contains('ag-root-wrapper-body'));

        expect(toolbarIndex).toBeGreaterThanOrEqual(0);
        expect(toolbarIndex).toBeLessThan(bodyIndex);
    });
});
