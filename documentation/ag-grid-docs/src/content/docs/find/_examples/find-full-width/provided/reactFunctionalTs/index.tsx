'use client';

import React, { StrictMode, useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
    ColDef,
    FindFullWidthCellRendererParams,
    GetFindMatchesParams,
    IsFullWidthRowParams,
    RowHeightParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import { FindModule, ToolbarModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { getData, getLatinText } from './data';
import FullWidthCellRenderer from './fullWidthCellRenderer';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

const modules = [FindModule, ToolbarModule, ClientSideRowModelModule];

const GridExample = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData] = useState<any[]>(getData());
    const [columnDefs] = useState<ColDef[]>([{ field: 'name' }, { field: 'continent' }, { field: 'language' }]);
    const defaultColDef = useMemo<ColDef>(
        () => ({
            flex: 1,
        }),
        []
    );

    const isFullWidth = useCallback((data: any) => {
        // return true when country is Peru, France or Italy
        return ['Peru', 'France', 'Italy'].indexOf(data.name) >= 0;
    }, []);

    const getRowHeight = useCallback((params: RowHeightParams) => {
        // return 100px height for full width rows
        if (isFullWidth(params.data)) {
            return 100;
        }
    }, []);

    const isFullWidthRow = useCallback((params: IsFullWidthRowParams) => {
        return isFullWidth(params.rowNode.data);
    }, []);

    const fullWidthCellRenderer = useMemo(() => FullWidthCellRenderer, []);

    const fullWidthCellRendererParams = useMemo<FindFullWidthCellRendererParams>(
        () => ({
            getFindMatches: (params: GetFindMatchesParams) => {
                const getMatchesForValue = params.getMatchesForValue;
                // this example only implements searching across part of the renderer
                let numMatches = getMatchesForValue('Sample Text in a Paragraph');
                getLatinText().forEach((paragraph) => {
                    numMatches += getMatchesForValue(paragraph);
                });
                return numMatches;
            },
        }),
        []
    );

    const toolbar = useMemo(() => ({ items: ['agFindToolbarItem' as const] }), []);

    return (
        <div style={containerStyle}>
            <div style={gridStyle}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    getRowHeight={getRowHeight}
                    isFullWidthRow={isFullWidthRow}
                    fullWidthCellRenderer={fullWidthCellRenderer}
                    fullWidthCellRendererParams={fullWidthCellRendererParams}
                    toolbar={toolbar}
                    modules={modules}
                />
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
