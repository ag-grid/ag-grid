import React, {useEffect, useState} from 'react';

const Grid = React.lazy(() =>
    import("../grid/Grid")
)

const COLUMN_DEFS = [
    {field: "key", width: 120, suppressSizeToFit: true},
    {field: "fixVersion", width: 120, suppressSizeToFit: true},
    {field: "summary"}
];

const IS_SSR = typeof window === "undefined"

const Changelog = () => {
    const [rowData, setRowData] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8080/jira_reports/cache/changelog.json")
            .then(response => response.json())
            .then(data => setRowData(data));
    }, [])

    const gridReady = (params) => {
        params.api.sizeColumnsToFit();
    }

    return (
        <>
            {!IS_SSR && (<div className="ag-theme-alpine" style={{height: "100vh", width: "100%"}}>
                <React.Suspense fallback={<div/>}>
                    <Grid
                        columnDefs={COLUMN_DEFS}
                        rowData={rowData}
                        onGridReady={gridReady}>
                    </Grid>
                </React.Suspense>
            </div>)}
        </>
    );
};

export default Changelog;
