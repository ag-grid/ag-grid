// noinspection ES6UnusedImports
import React, {useState} from 'react'
import {mount} from 'cypress-react-unit-test'
import {AgGridColumn} from "../../lib/agGridColumn";
import {AgGridReact} from "../../lib/agGridReact";
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";
import {ensureGridApiHasBeenSet} from "./utils";

class CRF extends React.Component {
    render() {
        return <>Hello thank you for your time to look at this problem</>;
    }
}

const App = (props) => {
    const columns = [
        {
            headerName: "A",
            field: "a",
            resizable: true
        },
        {
            headerName: "B",
            field: "b",
            cellRenderer: 'crf',
            cellStyle: {"white-space": "normal"},
            autoHeight: true,
            resizable: true
        }
    ];

    return (
        <div
            className="ag-theme-alpine"
            style={{
                height: "80vh",
                width: "500px"
            }}
        >
            <AgGridReact
                ref={(element) => {
                    window.gridComponentInstance = element
                }}
                columnDefs={columns}
                modules={[ClientSideRowModelModule]}
                frameworkComponents={{
                    crf: CRF
                }}
                rowData={[
                    {a: "Toyota", b: "Celica"},
                    {a: "Ford", b: "Mondeo"},
                    {a: "Porsche", b: "Boxter"}
                ]}
            />
        </div>
    );
};



/*class CRF extends React.Component {
    render() {
        return <>Hello thank you for your time to look at this problem</>;
    }
}


const App = () => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    const [rowData, setRowData] = useState([
        {value: "Toyota"},
        {value: "Ford"},
        {value: "Porsche"}
    ]);

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    }

    return (
        <div className="ag-theme-alpine" style={{height: 400, width: 600}}>
            <AgGridReact
                ref={(element) => {
                    window.gridComponentInstance = element
                }}
                onGridReady={onGridReady}
                rowData={rowData}
                modules={[ClientSideRowModelModule]}
                frameworkComponents={{
                    crf: CRF
                }}>
                <AgGridColumn
                    field="value"
                    cellRenderer='crf'
                    cellStyle={{"white-space": "normal"}}
                    autoHeight={true}
                ></AgGridColumn>
            </AgGridReact>
        </div>
    );
};*/

describe('Autoheight Grid', () => {
    beforeEach((done) => {
        window.gridComponentInstance = null;

        mount(<App/>, {
            stylesheets: [
                'https://unpkg.com/@ag-grid-community/core/dist/styles/ag-grid.css',
                'https://unpkg.com/@ag-grid-community/core/dist/styles/ag-theme-alpine.css'
            ]
        })

        ensureGridApiHasBeenSet().then(() => setTimeout(() => done(), 20), () => throw new Error("Grid API not set within expected time limits"));
    });
    afterEach(() => {
        window.gridComponentInstance = null;
    });

    it('Autoheight Cell Renders All Text', () => {
        console.log("here");
        cy.wait(5500).then(() => {
            console.log("here now");
            cy.contains('Hello thank you for your time to look at this problem').should('be.visible')
        });
    })
})
