'use strict';

import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';

import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const MyHeaderRenderer = forwardRef((props, ref) => {
    const id = props.column.getId();

    useImperativeHandle(ref, () => {
        return {
            refresh: (params) => {
                console.log(`MyHeaderRenderer.refresh ${id}`, params);
                return true;
            }
        };
    });

    useEffect(() => {
        return () => {
            console.log(`MyHeaderRenderer destroyed ${id}`, props);
        };
    }, []);

    console.log(`MyHeaderRenderer ID ${id}`);
    return (
        <div>Hello World!!!</div>
    )
});

const GridExample = () => {
    const [rowData, setRowData] = useState([]);
    const [columns, setColumns] = useState([
        {field: 'athlete'},
        {field: 'total'}
    ]);

    const onGridReady = (params) => {
        const httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                setRowData(JSON.parse(httpRequest.responseText));
            }
        };
    };

    const changeCols = (name, callback) => {
        const newColumns = [...columns];
        console.log('>> ' + name);
        newColumns.forEach(callback);
        setColumns(newColumns);
    }

    const onShowTotal = () => {
        console.log('>> onShowTotal');
        const newColumns = [...columns];
        newColumns[1].hide = false;
        setColumns(newColumns);
    };

    const onHideTotal = () => {
        console.log('>> onHideTotal');
        const newColumns = [...columns];
        newColumns[1].hide = true;
        setColumns(newColumns);
    };

    const onAHeaderNames = () => {
        changeCols('onAHeaderNames', c => {
            c.headerName = 'A ' + c.field
        })
    };

    const onBHeaderNames = () => {
        changeCols('onBHeaderNames', c => {
            c.headerName = 'B ' + c.field
        })
    };

    const onNoHeaderNames = () => {
        changeCols('onNoHeaderNames', c => {
            c.headerName = null
        })
    };

    const onSortOn = () => {
        changeCols('onSortOn', h => {
            h.sortable = true
        })
    };

    const onSortOff = () => {
        changeCols('onSortOff', h => {
            h.sortable = false
        })
    };

    const onMoveOn = () => {
        changeCols('moveOn', c => {
            c.suppressMovable = false
        })
    };

    const onMoveOff = () => {
        changeCols('moveOff', c => {
            c.suppressMovable = true
        })
    };

    const onTooltipA = () => {
        changeCols('onTooltipA', c => {
            c.headerTooltip = 'A ' + c.field;
        });
    };

    const onTooltipB = () => {
        changeCols('onTooltipB', c => {
            c.headerTooltip = 'B ' + c.field;
        });
    };

    const onTooltipOff = () => {
        changeCols('onTooltipOff', c => {
            c.headerTooltip = undefined;
        });
    };

    const onResizeOn = () => {
        changeCols('onResizeOn', c => {
            c.resizable = true;
        });
    };

    const onResizeOff = () => {
        changeCols('onResizeOff', c => {
            c.resizable = false;
        });
    };

    const onHeaderCompOn = () => {
        changeCols('onHeaderCompOn', c => {
            c.headerComponent = 'MyHeaderRenderer';
        });
    };

    const onHeaderCompOff = () => {
        changeCols('onHeaderCompOff', c => {
            c.headerComponent = null;
        });
    };

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div className="test-container">
                <div className="test-header">
                    <button style={{marginRight: 5}} onClick={onShowTotal}>Show Total</button>
                    <button style={{marginRight: 10}} onClick={onHideTotal}>Hide Total</button>

                    <button style={{marginRight: 5}} onClick={onAHeaderNames}>A Headers</button>
                    <button style={{marginRight: 10}} onClick={onBHeaderNames}>B Headers</button>

                    <button style={{marginRight: 5}} onClick={onNoHeaderNames}>Normal Headers</button>
                    <button style={{marginRight: 10}} onClick={onSortOn}>Sort On</button>

                    <button style={{marginRight: 5}} onClick={onSortOff}>Sort Off</button>
                    <button style={{marginRight: 10}} onClick={onMoveOn}>Move On</button>

                    <button style={{marginRight: 5}} onClick={onMoveOff}>Move Off</button>
                    <button style={{marginRight: 10}} onClick={onResizeOn}>Resize On</button>

                    <button style={{marginRight: 5}} onClick={onResizeOff}>Resize Off</button>
                    <button style={{marginRight: 10}} onClick={onTooltipA}>Tooltip A</button>

                    <button style={{marginRight: 5}} onClick={onTooltipB}>Tooltip B</button>
                    <button style={{marginRight: 10}} onClick={onTooltipOff}>Tooltip Off</button>

                    <button style={{marginRight: 5}} onClick={onHeaderCompOn}>Header Comp On</button>
                    <button onClick={onHeaderCompOff}>Header Comp Off</button>
                    <div
                        style={{
                            height: '100%',
                            width: '100%'
                        }}
                        className="ag-theme-alpine test-grid">
                        <AgGridReact
                            rowData={rowData}
                            onGridReady={onGridReady}
                            defaultColDef={{
                                initialWidth: 100,
                                sortable: true,
                                resizable: true
                            }}
                            frameworkComponents={{
                                MyHeaderRenderer
                            }}>
                            {columns.map(column => (<AgGridColumn {...column} key={column.field}/>))}
                        </AgGridReact>
                    </div>
                </div>
            </div>
        </div>
    );
};

render(
    <GridExample/>,
    document.querySelector('#root')
);
