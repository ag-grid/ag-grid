'use strict';

import React, { Component, memo } from 'react';
import { render } from 'react-dom';
import MyEditor from './myEditor.jsx';
import MyPopupEditor from './myPopupEditor.jsx';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

// this is a hook, but we work also with classes
function MyRenderer(params) {
    return (
        <span>
            <img src="https://d1yk6z6emsz7qy.cloudfront.net/static/images/loading.gif" style={{width: '40px', position: 'absolute'}}/>
            <span style={{marginLeft: '40px'}}>
                {params.value}
            </span>
        </span>
    );
}

class MyRendererClass extends React.Component {
    constructor(props) {
        super();
        this.props = props;
    }
    render() {
    return (
        <span>
            <img src="https://d1yk6z6emsz7qy.cloudfront.net/static/images/loading.gif" style={{width: '40px', position: 'absolute'}}/>
            <span style={{marginLeft: '40px'}}>
                {this.props.value}
            </span>
        </span>
    );
    }
}

function FullWidthRenderer() {
    return (
        <span>
            <img src="https://d1yk6z6emsz7qy.cloudfront.net/static/images/loading.gif" style={{width: '40px', position: 'absolute'}}/>
            <span style={{marginLeft: '40px'}}>
                Full Width Row
            </span>
        </span>
    );
}

// function myCompSelector(p) {
//     if (p.value<25) {
//         return {
//             component: 'apples'
//         }
//     }
// }

// function myCompSelector(p) {
//     if (p.value<25) {
//         return {
//             component: p => 'JS Func ' + p.value
//         }
//     }
// }

// function myCompSelector(p) {
//     if (p.value<25) {
//         return {
//             component: MyRenderer
//         }
//     }
// }

// function myCompSelector(p) {
//     if (p.value<25) {
//         return {
//             frameworkComponent: p => (<span>JSX {p.value}</span>)
//         }
//     }
// }


function isFullWidth(rowNode) {
    // return rowNode.data && rowNode.data.athlete == 'Michael Phelps'
    return false;
}

const athleteNames = ['Michael Phelps', 'Natalie Coughlin', 'Aleksey Nemov', 'Alicia Coutts', 'Missy Franklin', 'Ryan Lochte', 'Allison Schmitt', 'Ian Thorpe', 'Dara Torres', 'Cindy Klassen', 'Nastia Liukin', 'Marit Bjørgen', 'Sun Yang', 'Kirsty Coventry', 'Libby Lenton-Trickett'];

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modules: [ClientSideRowModelModule, RangeSelectionModule, RowGroupingModule, RichSelectModule],
            columnDefs: [
                {
                    headerName: 'JS Popup',
                    field: 'athlete',
                    cellEditor: 'agRichSelect',
                    cellEditorParams: {
                        values: athleteNames
                    },
                    cellEditorPopup: true,
                    // rowGroup: true,
                    // checkboxSelection: true,
                    // dndSource: true
                },
                {
                    headerName: 'JS Inline',
                    field: 'athlete',
                    cellEditorPopup: false,
                    // rowGroup: true,
                    // checkboxSelection: true,
                    // dndSource: true
                },
                {
                    headerName: 'React Popup',
                    field: 'age',
                    editable: true,
                    // cellRenderer: p => p.value,
                    // cellRenderer: 'bananas',
                    cellRendererFramework: memo(MyRenderer),
                    cellEditorFramework: MyPopupEditor,
                    cellEditorPopup: true,
                    // cellRendererSelector: myCompSelector
                },
                {
                    headerName: 'React Inline',
                    field: 'age',
                    editable: true,
                    // cellRenderer: p => p.value,
                    // cellRenderer: 'bananas',
                    cellRendererFramework: memo(MyRenderer),
                    cellEditorFramework: MyEditor,
                    cellEditorPopup: false,
                    // cellRendererSelector: myCompSelector
                },
                // {
                //     field: 'country',
                // },
                // {
                //     field: 'year',
                // },
                // {
                //     field: 'date',
                // },
                // {
                //     field: 'sport',
                // },
                // { field: 'gold' },
                // { field: 'silver' },
                // { field: 'bronze' },
                // { field: 'total' },
            ],
            defaultColDef: {
                resizable: true,
                sortable: true,
                editable: true
            },
            rowData: null,
            frameworkComponents: {
                'bananas': MyRenderer
            },
            components: {
                'apples': p => 'apples' + p.value
            }
        };
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        const updateData = (data) => {
            this.setState({ rowData: data });
        };

        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => updateData(data));
    };

    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div
                    id="myGrid"
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                    className="ag-theme-alpine"
                >
                    <AgGridReact
                    isFullWidthCell = {isFullWidth}
                    // groupUseEntireRow="true"
                        reactUi="true"
                        enableBrowserTooltips="true"
                        fullWidthCellRendererFramework= {FullWidthRenderer}
                        animateRows="true"
                        modules={this.state.modules}
                        columnDefs={this.state.columnDefs}
                        defaultColDef={this.state.defaultColDef}
                        enableRangeSelection={true}
                        onGridReady={this.onGridReady}
                        rowData={this.state.rowData}
                        rowSelection="multiple"
                        suppressRowClickSelection="true"
                        frameworkComponents={this.state.frameworkComponents}
                        components={this.state.components}
                    />
                </div>
            </div>
        );
    }
}

render(<GridExample></GridExample>, document.querySelector('#root'));
