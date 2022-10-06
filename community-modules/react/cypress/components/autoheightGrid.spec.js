// noinspection ES6UnusedImports
import React, { useState } from 'react'
import { mount } from 'cypress-react-unit-test'
import { AgGridColumn, AgGridReact } from "../..";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { cssProperty, ensureGridApiHasBeenSet, getTextWidth } from "./utils";

class CRF extends React.Component {
    render() {
        return <div className='cell-content'>Hello thank you for your time to look at this problem</div>;
    }
}

const App = () => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    const [rowData, setRowData] = useState([
        { value: "Toyota" },
        { value: "Ford" },
        { value: "Porsche" }
    ]);

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    }

    return (
        <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
            <AgGridReact
                ref={(element) => {
                    window.gridComponentInstance = element
                }}
                suppressReactUi={true}
                onGridReady={onGridReady}
                rowData={rowData}
                modules={[ClientSideRowModelModule]}
                comps={{
                    crf: CRF
                }}>
                <AgGridColumn
                    field="value"
                    cellRenderer='crf'
                    cellStyle={{ "white-space": "normal" }}
                    autoHeight
                ></AgGridColumn>
            </AgGridReact>
        </div>
    );
};

describe('Autoheight Grid', () => {
    beforeEach((done) => {
        window.gridComponentInstance = null;

        mount(<App />, {
            stylesheets: [
                'https://cdn.jsdelivr.net/npm/@ag-grid-community/styles/ag-grid.css',
                'https://cdn.jsdelivr.net/npm/@ag-grid-community/styles/ag-theme-alpine.css'
            ]
        })

        ensureGridApiHasBeenSet().then(() => setTimeout(() => done(), 20), () => throw new Error("Grid API not set within expected time limits"));
    });
    afterEach(() => {
        window.gridComponentInstance = null;
    });

    // disabled until AG-4485 is done
    xit('Autoheight Cell Renders All Text', () => {
        cy.get('.cell-content').then(cellElements => {
            for (const cellElement of cellElements) {
                const fontSize = cssProperty(cellElement, 'font-size');
                const fontFamily = cssProperty(cellElement, 'font-family');

                const cellText = cellElement.textContent;
                const textWidth = getTextWidth(cellText, `${fontSize} ${fontFamily}`);

                expect(textWidth).to.be.lessThan(cellElement.offsetWidth);
            }
        })
    })
})
