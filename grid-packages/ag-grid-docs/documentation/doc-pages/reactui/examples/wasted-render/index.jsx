'use strict';

import React, { useMemo, useEffect, useState, useRef, memo, useCallback} from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

// this is a hook, but we work also with classes
function RenderCounterCellRenderer(params) {
    const renderCountRef = useRef(1);
    return (
          <span className="my-renderer">
              <span className="render-count">({renderCountRef.current++})</span> {params.value} 
          </span>
    );
}

function GridExample() {

    // never changes, so we can use useMemo
    const modules = useMemo( ()=> [ClientSideRowModelModule, RangeSelectionModule, RowGroupingModule, RichSelectModule], []);

    const gridRef = useRef();

    const [memoOn, setMemoOn] = useState(true);
    const [columnDefs, setColumnDefs] = useState();

    useEffect( ()=> {
        // if memoOn=true, we memoise the cell renderer
        const cellRendererToUse = memoOn ? memo(RenderCounterCellRenderer) : RenderCounterCellRenderer;
        const colDefs = [
            { field: 'athlete', cellRendererFramework: cellRendererToUse },
            { field: 'country', cellRendererFramework: cellRendererToUse },
            { field: 'gold', cellRendererFramework: cellRendererToUse },
            { field: 'silver', cellRendererFramework: cellRendererToUse }
        ];
        setColumnDefs(colDefs);
    }, [memoOn]);

    // never changes, so we can use useMemo
    const defaultColDef = useMemo( ()=> ({
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
            .then( data => setRowData(data.slice(0,10)));
    }, []);

    const onClickIncreaseMedals = useCallback( () => {
        const gridApi = gridRef.current.api;
        gridApi.forEachNode( rowNode => {
            ['gold','silver'].forEach( colId => {
                if (Math.random()<.8) { return; }
                const currentVal = gridApi.getValue(colId, rowNode);
                rowNode.setDataValue(colId, currentVal + 1);
            });
        });
    });

    const onClickToggleMemo = useCallback( () => {
        setMemoOn( prev => !prev );
    });

    const memoCssClass = memoOn ? 'app-memo-on' : 'app-memo-off'

    return (
        <div className={['parent-div', memoCssClass].join(' ')}>
            <div className="buttons-div">
                <button onClick={onClickToggleMemo}>Toggle Memo</button>
                { memoOn && <span className="memo-on">Memo is ON</span> }
                { !memoOn && <span className="memo-off">Memo is OFF</span> }
            </div>
            <div className="grid-div">
                <AgGridReact 

                    // turn on AG Grid React UI
                    reactUi="true"

                    // used to access grid API
                    ref={gridRef}

                    // all other properties as normal...
                    className="ag-theme-alpine"
                    animateRows="true"
                    modules={modules}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowData={rowData}
                    enableRangeSelection={true}
                />
            </div>
        </div>
    );
}

render(<GridExample></GridExample>, document.querySelector('#root'));
