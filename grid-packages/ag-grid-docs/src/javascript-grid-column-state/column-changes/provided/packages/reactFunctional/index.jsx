'use strict'

import React, {useState} from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';

import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const dateComparator = (date1, date2) => {
    var date1Number = monthToComparableNumber(date1);
    var date2Number = monthToComparableNumber(date2);

    if (date1Number === null && date2Number === null) {
        return 0;
    }

    if (date1Number === null) {
        return -1;
    }

    if (date2Number === null) {
        return 1;
    }

    return date1Number - date2Number;
};

const colDefAthlete = (<AgGridColumn headerName='Athlete' field='athlete' key='athlete'/>);
const colDefSport = (<AgGridColumn headerName='Sport' field='sport' key='sport'/>);
const colDefAge = (<AgGridColumn headerName='Age' field='age' key='age'/>);
const colDefYear = (<AgGridColumn headerName='Year' field='year' key='year'/>);
const colDefDate = (<AgGridColumn headerName='Date' field='date' comparator={dateComparator} key='date'/>);
const colDefGold = (<AgGridColumn headerName='Gold' field='gold' key='gold'/>);
const colDefSilver = (<AgGridColumn headerName='Silver' field='silver' key='silver'/>);
const colDefBronze = (<AgGridColumn headerName='Bronze' field='bronze' key='bronze'/>);

const GridExample = () => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState([]);
    const [columns, setColumns] = useState([
        colDefAthlete,
        colDefSport,
        colDefAge,
        colDefYear,
        colDefDate
    ]);

    const [athleteChecked, setAthleteChecked] = useState(true);
    const [sportChecked, setSportChecked] = useState(true);
    const [ageChecked, setAgeChecked] = useState(true);
    const [yearChecked, setYearChecked] = useState(true);
    const [dateChecked, setDateChecked] = useState(true);
    const [goldChecked, setGoldChecked] = useState(false);
    const [silverChecked, setSilverChecked] = useState(false);
    const [bronzeChecked, setBronzeChecked] = useState(false);

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);

        const httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                setRowData(JSON.parse(httpRequest.responseText));
            }
        };
    };

    const onBtApply = (reverse) => {
        var cols = [];
        if (athleteChecked) {
            cols.push(colDefAthlete);
        }

        if (sportChecked) {
            cols.push(colDefSport);
        }

        if (ageChecked) {
            cols.push(colDefAge);
        }

        if (yearChecked) {
            cols.push(colDefYear);
        }

        if (dateChecked) {
            cols.push(colDefDate);
        }

        if (goldChecked) {
            cols.push(colDefGold);
        }

        if (silverChecked) {
            cols.push(colDefSilver);
        }

        if (bronzeChecked) {
            cols.push(colDefBronze);
        }

        if (reverse) {
            cols.reverse();
        }

        setColumns(cols);
    };

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div className="test-container">
                <div className="test-header">
                    Select columns to show then hit 'Apply'<br/>
                    <label><input type="checkbox" id="athlete" checked={athleteChecked}
                                  onChange={(event) => setAthleteChecked(event.target.checked)}/>Athlete</label>
                    <label><input type="checkbox" id="sport" checked={sportChecked}
                                  onChange={(event) => setSportChecked(event.target.checked)}/>Sport</label>
                    <label><input type="checkbox" id="age" checked={ageChecked}
                                  onChange={(event) => setAgeChecked(event.target.checked)}/>Age</label>
                    <label><input type="checkbox" id="year" checked={yearChecked}
                                  onChange={(event) => setYearChecked(event.target.checked)}/>Year</label>
                    <label><input type="checkbox" id="date" checked={dateChecked}
                                  onChange={(event) => setDateChecked(event.target.checked)}/>Date</label>
                    <label><input type="checkbox" id="gold" checked={goldChecked}
                                  onChange={(event) => setGoldChecked(event.target.checked)}/>Gold</label>
                    <label><input type="checkbox" id="silver" checked={silverChecked}
                                  onChange={(event) => setSilverChecked(event.target.checked)}/>Silver</label>
                    <label><input type="checkbox" id="bronze" checked={bronzeChecked}
                                  onChange={(event) => setBronzeChecked(event.target.checked)}/>Bronze</label>

                    <button onClick={() => onBtApply(false)}>Apply</button>
                    <button onClick={() => onBtApply(true)}>Apply Reverse</button>
                </div>

                <div
                    id="myGrid"
                    style={{
                        height: '100%',
                        width: '100%'
                    }}
                    className="ag-theme-alpine">
                    <AgGridReact
                        rowData={rowData}
                        onGridReady={onGridReady}
                        defaultColDef={{
                            enableRowGroup: true,
                            enablePivot: true,
                            enableValue: true,
                            width: 140,
                            sortable: true,
                            resizable: true,
                            filter: true
                        }}
                        sideBar={{
                            toolPanels: [
                                {
                                    id: "columns",
                                    labelDefault: "Columns",
                                    labelKey: "columns",
                                    iconKey: "columns",
                                    toolPanel: "agColumnsToolPanel",
                                    toolPanelParams: {suppressSyncLayoutWithGrid: true}
                                },
                                {
                                    id: "filters",
                                    labelDefault: "Filters",
                                    labelKey: "filters",
                                    iconKey: "filter",
                                    toolPanel: "agFiltersToolPanel",
                                    toolPanelParams: {suppressSyncLayoutWithGrid: true}
                                }
                            ]
                        }}
                        statusBar={{
                            statusPanels: [
                                {
                                    statusPanel: "agTotalRowCountComponent",
                                    align: "left",
                                    key: "totalRowComponent"
                                },
                                {
                                    statusPanel: "agFilteredRowCountComponent",
                                    align: "left"
                                },
                                {
                                    statusPanel: "agSelectedRowCountComponent",
                                    align: "center"
                                },
                                {
                                    statusPanel: "agAggregationComponent",
                                    align: "right"
                                }
                            ]
                        }}>
                        {columns}
                    </AgGridReact>
                </div>
            </div>
        </div>
    );

}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)


