import {html, PolymerElement} from "../node_modules/@polymer/polymer/polymer-element.js";
import "../node_modules/ag-grid-polymer/index.js";

import PartialMatchFilter from "./partial-match-filter.js";

class AgGridPolymerExample extends PolymerElement {
    static get template() {
        return html`
            <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css">
            <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-theme-balham.css">

            <button style="margin-bottom: 10px" on-click="onClicked">Filter Instance Method</button>
            <ag-grid-polymer style="width: 100%; height: 300px; "
                             class="ag-theme-balham"
                             enableFilter
                             gridOptions="{{gridOptions}}"
                             on-first-data-rendered="{{firstDataRendered}}"></ag-grid-polymer>
    `;
    }

    constructor() {
        super();

        this.gridOptions = {
            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs(),
            groupUseEntireRow: true,
            groupRowInnerRendererFramework: 'patial-match-filter',
            components: {
                partialMatchFilter: PartialMatchFilter
            }
        }
    }

    onClicked(event)  {
        this.gridOptions.api.getFilterInstance("name").getFrameworkComponentInstance().componentMethod("Hello World!");
    }


    createColumnDefs() {
        return [
            {headerName: "Row", field: "row", width: 450},
            {
                headerName: "Filter Component",
                field: "name",
                filterFramework: 'partial-match-filter',
                width: 430,
                menuTabs: ['filterMenuTab']
            }
        ];
    }

    createRowData() {
        return [
            {"row": "Row 1", "name": "Michael Phelps"},
            {"row": "Row 2", "name": "Natalie Coughlin"},
            {"row": "Row 3", "name": "Aleksey Nemov"},
            {"row": "Row 4", "name": "Alicia Coutts"},
            {"row": "Row 5", "name": "Missy Franklin"},
            {"row": "Row 6", "name": "Ryan Lochte"},
            {"row": "Row 7", "name": "Allison Schmitt"},
            {"row": "Row 8", "name": "Natalie Coughlin"},
            {"row": "Row 9", "name": "Ian Thorpe"}
        ];
    }

    firstDataRendered(params) {
        params.api.sizeColumnsToFit();
    }

}

customElements.define('ag-grid-polymer-example', AgGridPolymerExample);