import { RefObject, useEffect, useState } from 'react';
import { ColumnApi, GridApi } from '@ag-grid-community/core';
import { AgGridReact } from './agGridReact';

const useGridApis = <T extends AgGridReact>(gridRef: RefObject<T>): [GridApi | null, ColumnApi | null] => {
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [columnApi, setColumnApi] = useState<ColumnApi | null>(null);

    useEffect(() => {
        if (gridRef && gridRef.current) {
            setGridApi(gridRef.current.api)
            setColumnApi(gridRef.current.columnApi)
        }
    }, [gridRef])

    return [gridApi, columnApi];
};

export default useGridApis;