import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { ColDef, ColGroupDef, DoesFilterPassParams, FilterDisplay } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    ModuleRegistry,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import { AgGridReact, getInstance } from 'ag-grid-react';

import { getData } from './data';
import PartialMatchFilter from './partialMatchFilter';
import './styles.css';

ModuleRegistry.registerModules([
    TextFilterModule,
    TextEditorModule,
    CustomFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function doesFilterPass({ model, node, handlerParams }: DoesFilterPassParams<any, any, string>): boolean {
    const value = handlerParams.getValue(node).toString().toLowerCase();
    return model
        .toLowerCase()
        .split(' ')
        .every((filterWord) => value.indexOf(filterWord) >= 0);
}

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState<any[]>(getData());
    const [columnDefs, setColumnDefs] = useState<(ColDef | ColGroupDef)[] | null>([
        { field: 'row' },
        {
            field: 'name',
            filter: { component: PartialMatchFilter, doesFilterPass },
        },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            editable: true,
            flex: 1,
            minWidth: 100,
            filter: true,
        };
    }, []);

    const onClicked = useCallback(() => {
        gridRef.current!.api.getColumnFilterInstance('name').then((instance) => {
            getInstance<FilterDisplay, FilterDisplay & { componentMethod(message: string): void }>(
                instance as FilterDisplay,
                (component) => {
                    if (component) {
                        component.componentMethod('Hello World!');
                    }
                }
            );
        });
    }, []);

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <button style={{ marginBottom: '5px' }} onClick={onClicked} className="btn btn-primary">
                    Invoke Filter Instance Method
                </button>

                <div style={gridStyle}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        enableFilterHandlers
                    />
                </div>
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
