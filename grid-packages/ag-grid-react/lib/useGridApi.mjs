// ag-grid-react v30.0.4
import { useEffect, useState } from 'react';
const useGridApis = (gridRef) => {
    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState(null);
    useEffect(() => {
        if (gridRef && gridRef.current) {
            setGridApi(gridRef.current.api);
            setColumnApi(gridRef.current.columnApi);
        }
    }, [gridRef]);
    return [gridApi, columnApi];
};
export default useGridApis;
