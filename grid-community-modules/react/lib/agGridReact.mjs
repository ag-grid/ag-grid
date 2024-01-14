// @ag-grid-community/react v31.0.0
import React, { Component } from 'react';
import { AgGridReactUi } from './reactUi/agGridReactUi.mjs';
export class AgGridReact extends Component {
    constructor() {
        super(...arguments);
        this.apiListeners = [];
        this.setGridApi = (api, columnApi) => {
            this.api = api;
            this.columnApi = columnApi;
            this.apiListeners.forEach(listener => listener(api));
        };
    }
    registerApiListener(listener) {
        this.apiListeners.push(listener);
    }
    componentWillUnmount() {
        this.apiListeners.length = 0;
    }
    render() {
        return React.createElement(AgGridReactUi, Object.assign({}, this.props, { setGridApi: this.setGridApi }));
    }
}
