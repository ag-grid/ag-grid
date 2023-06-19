// ag-grid-react v30.0.2
import React, { Component } from 'react';
import { AgGridReactLegacy } from './legacy/agGridReactLegacy';
import { AgGridReactUi } from './reactUi/agGridReactUi';
export class AgGridReact extends Component {
    constructor() {
        super(...arguments);
        this.setGridApi = (api, columnApi) => {
            this.api = api;
            this.columnApi = columnApi;
        };
    }
    render() {
        const ReactComponentToUse = this.props.suppressReactUi ?
            React.createElement(AgGridReactLegacy, Object.assign({}, this.props, { setGridApi: this.setGridApi }))
            : React.createElement(AgGridReactUi, Object.assign({}, this.props, { setGridApi: this.setGridApi }));
        return ReactComponentToUse;
    }
}
