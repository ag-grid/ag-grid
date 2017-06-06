import React, {Component} from "react";
import {Provider} from "react-redux";
import {createStore} from "redux";
// take this line out if you do not want to use ag-Grid-Enterprise
import "ag-grid-enterprise";

import HeaderComponent from "./HeaderComponent";
import GridComponent from "./GridComponent";

import gridData from "./gridDataReducer";

let store = createStore(gridData);

/*
 * This component serves as a container for both the header and grid components. It's primarily here to act as a container
 * for the redux Provider
 */
export default class SimpleReduxExample extends Component {
    constructor(props) {
        super(props);

        this.setGroupingEnabled = this.setGroupingEnabled.bind(this);
    }

    setGroupingEnabled(enabled) {
        this.grid.setGroupingEnabled(enabled);
    }

    render() {
        return (
            <Provider store={store}>
                <div>
                    <h1>Simple Redux Example using ag-Grid's deltaRowMode</h1>
                    <HeaderComponent setGroupingEnabled={this.setGroupingEnabled} />
                    <GridComponent ref={ grid => { this.grid = grid ? grid.getWrappedInstance() : null }} />
                </div>
            </Provider>
        )
    }
};
