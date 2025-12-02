import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { isAgHtmlElementVisible } from '../test-utils';

describe('ag-grid overlays state (react)', () => {
    const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'sport' }, { field: 'age' }];

    function hasLoadingOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-loading-center'));
    }

    function hasNoRowsOverlay() {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-no-rows-center'));
    }

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule]);
    });

    beforeEach(() => {
        cleanup();
    });

    test('react render of loading and no-rows', () => {
        const { rerender } = render(<AgGridReact columnDefs={columnDefs} rowData={[]} loading />);
        expect(hasLoadingOverlay()).toBe(true);
        expect(hasNoRowsOverlay()).toBe(false);

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[]} loading={false} />);
        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(true);

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[{}]} loading />);
        expect(hasLoadingOverlay()).toBe(true);
        expect(hasNoRowsOverlay()).toBe(false);

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[{}]} loading={false} />);
        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(false);

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[]} />);
        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(true);
    });

    test('react render suppress no-rows via suppressNoRowsOverlay', () => {
        render(<AgGridReact columnDefs={columnDefs} rowData={[]} suppressNoRowsOverlay />);
        expect(hasNoRowsOverlay()).toBe(false);
    });

    test('react render suppress no-rows via suppressOverlays', () => {
        render(<AgGridReact columnDefs={columnDefs} rowData={[]} suppressOverlays={['noRows']} />);
        expect(hasNoRowsOverlay()).toBe(false);
    });

    test('react custom no rows overlay via overlayNoRowsTemplate', () => {
        const noRowsOverlayTemplate = '<span>No Rows Span</span>';
        const { getByText, rerender } = render(
            <AgGridReact columnDefs={columnDefs} rowData={[]} overlayNoRowsTemplate={noRowsOverlayTemplate} />
        );
        expect(getByText('No Rows Span')).toBeTruthy();

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[{}]} overlayNoRowsTemplate={noRowsOverlayTemplate} />);
        expect(hasNoRowsOverlay()).toBe(false);
    });

    test('react custom no rows overlay via overlayNoRowsTemplate - simple string', () => {
        const noRowsOverlayTemplate = 'No Rows String';
        const { getByText, rerender } = render(
            <AgGridReact columnDefs={columnDefs} rowData={[]} overlayNoRowsTemplate={noRowsOverlayTemplate} />
        );
        expect(getByText('No Rows String')).toBeTruthy();

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[{}]} overlayNoRowsTemplate={noRowsOverlayTemplate} />);
        expect(hasNoRowsOverlay()).toBe(false);
    });

    test('loading=true has precedence over rowData=[] in React', () => {
        const { rerender } = render(<AgGridReact columnDefs={undefined} rowData={undefined} loading={true} />);

        expect(hasLoadingOverlay()).toBe(true);
        expect(hasNoRowsOverlay()).toBe(false);

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[]} loading />);

        expect(hasLoadingOverlay()).toBe(true);
        expect(hasNoRowsOverlay()).toBe(false);

        rerender(<AgGridReact columnDefs={[...columnDefs]} rowData={[]} loading />);

        expect(hasLoadingOverlay()).toBe(true);
        expect(hasNoRowsOverlay()).toBe(false);

        rerender(<AgGridReact columnDefs={columnDefs} rowData={[]} loading={false} />);

        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(true);
    });

    test('loading=true custom component has precedence over rowData=[] in React', async () => {
        const CustomLoadingOverlay: React.FC = () => <div className="custom-loading">Custom Loading</div>;
        const CustomNoRowsOverlay: React.FC = () => <div className="custom-no-rows">Custom No Rows</div>;
        const overlayComponents = {
            loadingOverlayComponent: CustomLoadingOverlay,
            noRowsOverlayComponent: CustomNoRowsOverlay,
        } as const;

        const { rerender } = render(
            <AgGridReact {...overlayComponents} columnDefs={undefined} rowData={undefined} loading={true} />
        );

        await waitFor(() => expect(document.querySelector('.custom-loading')).toBeTruthy());
        expect(document.querySelector('.custom-no-rows')).toBeNull();

        rerender(<AgGridReact {...overlayComponents} columnDefs={columnDefs} rowData={[]} loading />);

        await waitFor(() => expect(document.querySelector('.custom-loading')).toBeTruthy());
        expect(document.querySelector('.custom-no-rows')).toBeNull();

        rerender(<AgGridReact {...overlayComponents} columnDefs={[...columnDefs]} rowData={[]} loading />);

        await waitFor(() => expect(document.querySelector('.custom-loading')).toBeTruthy());
        expect(document.querySelector('.custom-no-rows')).toBeNull();

        rerender(<AgGridReact {...overlayComponents} columnDefs={columnDefs} rowData={[]} loading={false} />);

        await waitFor(() => expect(document.querySelector('.custom-loading')).toBeNull());
        await waitFor(() => expect(document.querySelector('.custom-no-rows')).toBeTruthy());
    });

    test('react active overlay refreshes only when activeOverlayParams change', async () => {
        const TrackingActiveOverlay: React.FC<{ fromTest?: string }> = ({ fromTest }) => (
            <div className="tracking-active-overlay">{fromTest ?? ''}</div>
        );

        const baseProps = {
            columnDefs,
            rowData: [{}],
            components: { myActiveOverlay: TrackingActiveOverlay },
            activeOverlay: 'myActiveOverlay',
        };

        const getOverlayText = () => document.querySelector('.tracking-active-overlay')?.textContent;

        const { rerender } = render(
            <AgGridReact {...baseProps} activeOverlayParams={{ fromTest: 'active-initial' }} />
        );

        await waitFor(() => expect(getOverlayText()).toBe('active-initial'));

        rerender(<AgGridReact {...baseProps} activeOverlayParams={{ fromTest: 'active-updated' }} />);

        await waitFor(() => expect(getOverlayText()).toBe('active-updated'));
    });

    test('loading=true custom component has precedence over rowData=[] in React StrictMode', async () => {
        const CustomLoadingOverlay: React.FC = () => <div className="custom-loading">Custom Loading</div>;
        const CustomNoRowsOverlay: React.FC = () => <div className="custom-no-rows">Custom No Rows</div>;
        const overlayComponents = {
            loadingOverlayComponent: CustomLoadingOverlay,
            noRowsOverlayComponent: CustomNoRowsOverlay,
        } as const;

        const { rerender } = render(
            <React.StrictMode>
                <AgGridReact {...overlayComponents} columnDefs={undefined} rowData={undefined} loading={true} />
            </React.StrictMode>
        );

        await waitFor(() => expect(document.querySelector('.custom-loading')).toBeTruthy());
        expect(document.querySelector('.custom-no-rows')).toBeNull();

        rerender(
            <React.StrictMode>
                <AgGridReact {...overlayComponents} columnDefs={columnDefs} rowData={[]} loading />
            </React.StrictMode>
        );

        await waitFor(() => expect(document.querySelector('.custom-loading')).toBeTruthy());
        expect(document.querySelector('.custom-no-rows')).toBeNull();

        rerender(
            <React.StrictMode>
                <AgGridReact {...overlayComponents} columnDefs={[...columnDefs]} rowData={[]} loading />
            </React.StrictMode>
        );

        await waitFor(() => expect(document.querySelector('.custom-loading')).toBeTruthy());
        expect(document.querySelector('.custom-no-rows')).toBeNull();

        rerender(
            <React.StrictMode>
                <AgGridReact {...overlayComponents} columnDefs={columnDefs} rowData={[]} loading={false} />
            </React.StrictMode>
        );

        await waitFor(() => expect(document.querySelector('.custom-loading')).toBeNull());
        await waitFor(() => expect(document.querySelector('.custom-no-rows')).toBeTruthy());
    });
});
