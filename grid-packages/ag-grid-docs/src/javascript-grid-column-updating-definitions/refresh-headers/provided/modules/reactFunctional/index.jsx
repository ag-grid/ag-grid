'use strict';

import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {render} from 'react-dom';
import {AllCommunityModules} from "@ag-grid-community/all-modules";
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

const CustomHeader = forwardRef((props, ref) => {
    const [ascSort, setAscSort] = useState('inactive');
    const [descSort, setDescSort] = useState('inactive');
    const [noSort, setNoSort] = useState('inactive');
    const [enableMenu, setEnableMenu] = useState(props.enableMenu);
    const [enableSorting, setEnableSorting] = useState(props.enableSorting);
    const [displayName, setDisplayName] = useState(props.displayName);
    const refMenuButton = useRef(null);

    useImperativeHandle(ref, () => {
        return {
            refresh(params) {
                setDisplayName(params.displayName);
                setEnableMenu(params.enableMenu);
                setEnableSorting(params.enableSorting);
                return true;
            }
        };
    });

    useEffect(() => {
        props.column.addEventListener('sortChanged', onSortChanged);

        onSortChanged();

        return () => {
            props.column.remoteEventListener('sortChanged', onSortChanged);
        };
    }, []);

    const onMenuClicked = () => {
        props.showColumnMenu(refMenuButton.current);
    }

    const onSortChanged = () => {
        setAscSort(props.column.isSortAscending() ? 'active' : 'inactive');
        setDescSort(props.column.isSortDescending() ? 'active' : 'inactive');
        setNoSort(!props.column.isSortAscending() && !props.column.isSortDescending() ? 'active' : 'inactive');
    }

    const onSortRequested = (order, event) => {
        props.setSort(order, event.shiftKey);
    }

    let menu = null;
    if (enableMenu) {
        menu =
            <div ref={refMenuButton}
                 className="ag-icon ag-icon-menu"
                 onClick={() => onMenuClicked()}>
            </div>;
    }

    let sort = null;
    if (enableSorting) {
        sort =
            <div style={{display: "inline-block"}}>
                <div onClick={() => onSortRequested('asc')}
                     onTouchEnd={() => onSortRequested('asc')}
                     className={`customSortDownLabel ${ascSort}`}>
                    <i class="fa fa-long-arrow-alt-down"></i>
                </div>
                <div onClick={() => onSortRequested('desc')}
                     onTouchEnd={() => onSortRequested('desc')}
                     className={`customSortUpLabel ${descSort}`}>
                    <i class="fa fa-long-arrow-alt-up"></i>
                </div>
                <div onClick={() => onSortRequested('')} onTouchEnd={() => onSortRequested('')}
                     className={`customSortRemoveLabel ${noSort}`}>
                    <i class="fa fa-times"></i>
                </div>
            </div>;
    }

    return (
        <div style={{display: 'flex'}}>
            {menu}
            <div className="customHeaderLabel">{displayName}</div>
            {sort}
        </div>
    );
});

const GridExample = () => {
    const [rowData, setRowData] = useState([]);
    const [columns, setColumns] = useState([
        {field: "athlete"},
        {field: "age"},
        {field: "country"},
        {field: "year"},
        {field: "date"},
        {field: "sport"},
        {field: "gold"},
        {field: "silver"},
        {field: "bronze"},
        {field: "total"}
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

    const onBtUpperNames = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(c => {
            c.headerName = c.field.toUpperCase();
        });
        setColumns(columnDefs);
    };

    const onBtLowerNames = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(c => {
            c.headerName = c.field;
        });
        setColumns(columnDefs);
    };

    const onBtFilterOn = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(c => {
            c.filter = true;
        });
        setColumns(columnDefs);
    };

    const onBtFilterOff = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(c => {
            c.filter = false;
        });
        setColumns(columnDefs);
    };

    const onBtResizeOn = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(c => {
            c.resizable = true;
        });
        setColumns(columnDefs);
    };

    const onBtResizeOff = () => {
        const columnDefs = [...columns];
        columnDefs.forEach(c => {
            c.resizable = false;
        });
        setColumns(columnDefs);
    };
    return (
        <div style={{width: '100%', height: '100%'}}>
            <div className="test-container">
                <div className="test-header">
                    <button onClick={() => onBtUpperNames()}>Upper Header Names</button>
                    <button onClick={() => onBtLowerNames()}>Lower Lower Names</button>
                    &nbsp;&nbsp;&nbsp;
                    <button onClick={() => onBtFilterOn()}>Filter On</button>
                    <button onClick={() => onBtFilterOff()}>Filter Off</button>
                    &nbsp;&nbsp;&nbsp;
                    <button onClick={() => onBtResizeOn()}>Resize On</button>
                    <button onClick={() => onBtResizeOff()}>Resize Off</button>
                </div>
                <div
                    style={{
                        height: '100%',
                        width: '100%'
                    }}
                    className="ag-theme-alpine test-grid">
                    <AgGridReact
                        rowData={rowData}
                        modules={AllCommunityModules}
                        onGridReady={onGridReady}
                        defaultColDef={{
                            headerComponent: 'CustomHeader'
                        }
                        }
                        frameworkComponents={{
                            CustomHeader
                        }}>
                        {columns.map(column => (<AgGridColumn {...column} key={column.field}/>))}
                    </AgGridReact>
                </div>
            </div>
        </div>
    );
};

render(
    <GridExample/>,
    document.querySelector('#root')
);
