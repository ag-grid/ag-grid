'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';
import { AgGridReact } from '@ag-grid-community/react';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import React, { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState, useCallback } from 'react';
import { render } from 'react-dom';

const SimpleHeader = memo((props) => {
    return (
        <span className="my-header">{props.displayName}</span>
    );
});

const ImageHeader = memo((props) => {
    return (
        <span className="image-header my-header">
            <img src="https://d1yk6z6emsz7qy.cloudfront.net/static/images/loading.gif" className="my-spinner"/>
            {props.displayName}
        </span>
    );
});

const SortingHeader = memo((props) => {

    const [sortState, setSortState] = useState();

    const onClick = useCallback( ()=> {
        props.progressSort();
    });

    useEffect( ()=> {
        const listener = () => {
            if (props.column.isSortAscending()) {
                setSortState('ASC');
            } else if (props.column.isSortDescending() ) {
                setSortState('DESC');
            } else {
                setSortState(undefined);
            }
        };

        props.column.addEventListener('sortChanged', listener);

        return ()=> props.column.removeEventListener('sortChanged', listener);;
    }, []);

    return (
        <span className="my-header" onClick={onClick}>
            {props.displayName} {sortState}
        </span>
    );
});

function GridExample() {

    // never changes, so we can use useMemo
    const modules = useMemo( ()=> [ClientSideRowModelModule, RangeSelectionModule, RowGroupingModule, RichSelectModule], []);

    // never changes, so we can use useMemo
    const columnDefs = useMemo( ()=> [
        { field: 'athlete', headerComponentFramework: SimpleHeader },
        { field: 'age', headerComponentFramework: ImageHeader },
        { field: 'country', headerComponentFramework: SortingHeader },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' }
    ], []);

    // never changes, so we can use useMemo
    const defaultColDef = useMemo( ()=> ({
        filter: true,
        resizable: true,
        sortable: true,
        flex: 1
    }), []);

    // changes, needs to be state
    const [rowData, setRowData] = useState();

    // gets called once, no dependencies, loads the grid data
    useEffect( ()=> {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then( resp => resp.json())
            .then( data => setRowData(data));
    }, []);

    return (
        <AgGridReact 

            // turn on AG Grid React UI
            reactUi="true"

            // all other properties as normal...
            className="ag-theme-alpine"
            floatingFilter={true}
            animateRows="true"
            modules={modules}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowData={rowData}
        />
    );
}

render(<GridExample></GridExample>, document.querySelector('#root'));
