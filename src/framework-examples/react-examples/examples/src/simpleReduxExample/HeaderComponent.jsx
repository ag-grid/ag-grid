import React, {Component} from "react";
import {connect} from "react-redux";
// take this line out if you do not want to use ag-Grid-Enterprise
import "ag-grid-enterprise";

import {updateRowData} from "./gridDataActions";

/*
 * This component serves both to host the demo controls, which in turn will drive row data state changes
 */
class HeaderComponent extends Component {
    constructor(props) {
        super(props);

        this.addFiveItems = this.addFiveItems.bind(this);
        this.removeSelected = this.removeSelected.bind(this);
        this.updatePrices = this.updatePrices.bind(this);
        this.setGroupingEnabled = this.setGroupingEnabled.bind(this);
        this.setItemVisible = this.setItemVisible.bind(this);
        this.setSelectedToGroup = this.setSelectedToGroup.bind(this);
    }

    componentDidMount() {
        // provide the initial data to the store (which in turn will populate the grid)
        this.props.dispatch(updateRowData(this.createRowData()));
    }

    // add five new items to the row data and publish the change
    addFiveItems() {
        let newRowData = this.props.rowData.slice();
        for (let i = 0; i < 5; i++) {
            let newItem = this.createItem();
            newRowData.push(newItem);
        }

        this.props.dispatch(updateRowData(newRowData));
    }

    // remove selected rows from the data set and publish the change
    removeSelected() {
        let newRowData = this.props.rowData.filter((dataItem) => (this.props.rowSelection.indexOf(dataItem.symbol) < 0));
        this.props.dispatch(updateRowData(newRowData));
    }

    // group data based on selection and publish the change
    setSelectedToGroup(newGroup) {
        let selectedIds = this.props.rowSelection;
        let newRowData = this.props.rowData.map((dataItem) => {
            let itemSelected = selectedIds.indexOf(dataItem.symbol) >= 0;
            if (itemSelected) {
                return {
                    // symbol and price stay the same
                    symbol: dataItem.symbol,
                    price: dataItem.price,
                    // group gets the group
                    group: newGroup
                };
            } else {
                return dataItem;
            }
        });

        this.props.dispatch(updateRowData(newRowData));
    }

    // randomly update prices in the row data and publish the change
    updatePrices() {
        let newRowData = [];
        this.props.rowData.forEach(function (item) {
            newRowData.push({
                // use same symbol as last time, this is the unique id
                symbol: item.symbol,
                // group also stays the same
                group: item.group,
                // add random price
                price: Math.floor(Math.random() * 100)
            });
        });

        this.props.dispatch(updateRowData(newRowData));
    }


    setGroupingEnabled(enabled) {
        // let the parent (and the grid in turn) know about the grouping state change
        this.props.setGroupingEnabled(enabled);

        // toggle the grouping buttons visibility
        this.setItemVisible('groupingOn', !enabled);
        this.setItemVisible('groupingOff', enabled);
    }

    setItemVisible(id, visible) {
        let element = document.querySelector('#' + id);
        element.style.display = visible ? null : 'none';
    }

    render() {
        return (
            <div style={{marginTop: 15}}>
                <button onClick={this.addFiveItems}>Add Five Items</button>
                <button onClick={this.removeSelected}>Remove Selected</button>
                <button onClick={this.updatePrices}>Update Prices</button>

                <span style={{padding: 10}}/>
                <button id="groupingOn" onClick={() => this.setGroupingEnabled(true)}>Turn Grouping On</button>
                <button id="groupingOff" style={{display: "none"}} onClick={() => this.setGroupingEnabled(false)}>Turn
                    Grouping Off
                </button>
                <span style={{padding: 10}}/>
                <span style={{border: "1px  solid lightgrey", padding: 4}}>
                Group Selected:
                    <button onClick={() => this.setSelectedToGroup('A')}>A</button>
                    <button onClick={() => this.setSelectedToGroup('B')}>B</button>
                    <button onClick={() => this.setSelectedToGroup('C')}>C</button>
                </span>
            </div>
        )
    }

    // the following methods are for creating dummy row data
    createRowData() {
        let rowData = [];

        for (let i = 0; i < 14; i++) {
            let newItem = this.createItem();
            rowData.push(newItem);
        }

        return rowData;
    }

    createItem() {
        return {
            group: 'A',
            symbol: this.createUniqueRandomSymbol(),
            price: Math.floor(Math.random() * 100)
        };
    }

    // creates a unique symbol, eg 'ADG' or 'ZJD'
    createUniqueRandomSymbol() {
        let symbol;
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        let isUnique = false;
        while (!isUnique) {
            symbol = '';
            // create symbol
            for (let i = 0; i < 3; i++) {
                symbol += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            // check uniqueness
            isUnique = true;
            this.props.rowData.forEach(function (oldItem) {
                if (oldItem.symbol === symbol) {
                    isUnique = false;
                }
            });
        }

        return symbol;
    }
}

// pull off row data and selected row changes
export default connect(
    (state) => {
        return {
            rowData: state.rowData,
            rowSelection: state.rowSelection
        }
    }
)(HeaderComponent);