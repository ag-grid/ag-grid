// noinspection ES6UnusedImports
import React, {Component, useContext, useReducer, useState} from 'react'
import {mount} from 'cypress-react-unit-test'
import {AgGridReact} from "../..";
import {ensureGridApiHasBeenSet} from "./utils";

const Context = React.createContext();
const FontContext = React.createContext('normal');

class PriceRenderer extends Component {
    static contextType = Context;

    constructor(props) {
        super(props);
    }

    applyExchangeRate = (exchangeRate, value) => {
        return parseFloat(value * exchangeRate).toFixed(2); // simplified/naive exchange rate implementation!
    }

    render() {
        const {currencySymbol, exchangeRate} = this.context.store;

        return (
            <FontContext.Consumer>
                {fontWeight => <span
                    style={{fontWeight}}> {currencySymbol}{this.applyExchangeRate(exchangeRate, this.props.value)}</span>}
            </FontContext.Consumer>
        );
    }
}

const initialState = {
    rowData: [],
    columnDefs: [
        {
            field: 'price',
            cellClass: 'align-right',
            cellRenderer: PriceRenderer
        }
    ]
};

const reducer = (state = {rowData: []}, action) => {
    switch (action.type) {
        case 'SET_ROW_DATA':
            return {
                ...state,
                rowData: createRowData(),
                currencySymbol: action.currencySymbol,
                exchangeRate: action.exchangeRate
            };
        case 'ROW_DATA_CHANGED':
            return {
                ...state,
                rowData: action.rowData,
            };
        case 'CURRENCY_CHANGED':
            return {
                ...state,
                currencySymbol: action.currencySymbol,
                exchangeRate: action.exchangeRate
            };
        default:
            return state;
    }
};

const createRowData = () => {
    let rowData = [];

    for (let i = 0; i < 5; i++) {
        let newItem = {
            price: 10 * i
        };
        rowData.push(newItem);
    }

    return rowData;
};


const GridComponent = () => {
    const {store, dispatch} = useContext(Context);
    const {columnDefs, rowData} = store;

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
    };

    return (
        <div style={{height: 400, width: 900, marginTop: 15}}
             className="ag-theme-alpine">
            <AgGridReact
                ref={(element) => {
                    window.gridComponentInstance = element
                }}
                suppressReactUi={true}
                columnDefs={columnDefs}
                rowData={rowData}
                onGridReady={onGridReady}>
            </AgGridReact>
        </div>
    )
}

const SimpleContextHookExample = () => {
    const [store, dispatch] = useReducer(reducer, initialState);

    function setCurrency(currencySymbol, exchangeRate) {
        dispatch({
            type: 'CURRENCY_CHANGED',
            currencySymbol,
            exchangeRate
        });
    }

    function populateRowData() {
        dispatch({
            type: "SET_ROW_DATA",
            currencySymbol: '£',
            exchangeRate: 1
        });
    };

    return (
        <Context.Provider value={{store, dispatch}}>
            <div>
                <button onClick={() => populateRowData()} className="populateRowData">Populate Row Data
                </button>
                <button onClick={() => setCurrency('£', 1)} className="setCurrencyToGBP">Set Currency to GBP</button>
                <button onClick={() => setCurrency('$', 1.29)} className="setCurrencyToUSD">Set Currency to USD</button>
                <FontContext.Provider value="bold">
                    <GridComponent/>
                </FontContext.Provider>
            </div>
        </Context.Provider>
    )
}

describe('Context/Reducer Example', () => {
    beforeEach((done) => {
        window.gridComponentInstance = null;

        mount(<SimpleContextHookExample/>, {
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

    it('Initial Render Has No Rows', () => {
        cy.get('.ag-cell-value')
            .should('have.length', 0)
    })

    it('Populating Row Data Via Context Renders', () => {
        cy.get('.populateRowData').click()
        cy.get('.ag-cell-value')
            .should('have.length', 5);
        cy.contains('£0.00').should('be.visible')
        cy.contains('£10.00').should('be.visible')
        cy.contains('£20.00').should('be.visible')

        cy.get('div .ag-react-container')
            .each((value, index, collection) => {
                cy.wrap(value)
                    .invoke('css', 'fontWeight')
                    .then(fontWeight => expect(fontWeight).to.equal('400'))
            })

    })

    it('Changing Currency Updates Row Data', () => {
        cy.get('.populateRowData').click()
        cy.get('.setCurrencyToUSD').click()

        cy.get('.ag-cell-value')
            .should('have.length', 5);

        cy.contains('$0.00').should('be.visible')
        cy.contains('$12.90').should('be.visible')
        cy.contains('$25.80').should('be.visible')

        cy.get('div .ag-react-container')
            .each((value, index, collection) => {
                cy.wrap(value)
                    .invoke('css', 'fontWeight')
                    .then(fontWeight => expect(fontWeight).to.equal('400'))
            })

    })
})
