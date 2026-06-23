import styled from '@emotion/styled';
import { memo, useLayoutEffect, useRef } from 'react';

import type { ColDef, GridState, RowSelectionOptions, Theme } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { defaultRowData } from '../grid-config/grid-data';

// A tiny non-interactive grid used as a theme thumbnail
const columnDefs: ColDef[] = [{ field: 'country' }, { field: 'sport' }];

const defaultColDef: ColDef = {
    width: 150,
};

const rowData = defaultRowData().slice(0, 4);

// Show the left checkbox selection column, matching the main preview grid.
const rowSelection: RowSelectionOptions = { mode: 'multiRow' };

// Pre-select the second row (default node id is the row index) so the preview
// shows the selected-row styling.
const initialState: GridState = { rowSelection: ['1'] };

interface PresetRenderProps {
    theme: Theme;
}

export const PresetRender = memo(({ theme }: PresetRenderProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        containerRef.current?.setAttribute('inert', '');
    }, []);
    return (
        <Wrapper className="preset-render">
            <GridContainer ref={containerRef}>
                <AgGridReact
                    theme={theme}
                    loadThemeGoogleFonts={true}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowData={rowData}
                    rowSelection={rowSelection}
                    initialState={initialState}
                    suppressColumnVirtualisation={true}
                    suppressRowVirtualisation={true}
                />
            </GridContainer>
        </Wrapper>
    );
});

const Wrapper = styled('div')`
    width: 350px;
    height: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    cursor: pointer;

    background-color: color-mix(in srgb, var(--page-background-color, transparent), var(--color-fg-primary) 3%);
    border: solid 1px color-mix(in srgb, var(--page-background-color, transparent), var(--color-fg-primary) 7%);

    transition:
        background-color 0.25s,
        border-color 0.25s;

    :hover {
        border-color: color-mix(in srgb, var(--page-background-color, transparent), var(--color-fg-primary) 10%);
        background-color: color-mix(in srgb, var(--page-background-color, transparent), var(--color-fg-primary) 6%);
    }
`;

const GridContainer = styled('div')`
    position: absolute;
    top: 25px;
    left: 25px;
    width: 600px;
    height: 500px;
    pointer-events: none;

    transition: transform 0.25s;

    .preset-render:hover & {
        transform: translate(-5px, -5px);
    }
`;
