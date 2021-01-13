import { html, PolymerElement } from 'https://unpkg.com/@polymer/polymer@3.4.1/polymer-element.js';
import 'https://unpkg.com/@ag-grid-community/polymer/index.js';

import MoodRenderer from './mood-renderer.js';
import MoodEditor from './mood-editor.js';
import NumericEditor from './numeric-editor.js';

class AgGridPolymerExample extends PolymerElement {
    static get template() {
        return html`
            <link rel="stylesheet" href="https://unpkg.com/@ag-grid-community/all-modules/dist/styles/ag-grid.css">
            <link rel="stylesheet" href="https://unpkg.com/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css">

            <div style="display: flex; flex-direction: column; height: 100%;">
                <div style="flex: 1 1 auto;">
                    <ag-grid-polymer style="height: 100%;"
                        class="ag-theme-alpine"
                        gridOptions="{{gridOptions}}"
                        on-first-data-rendered="{{firstDataRendered}}"></ag-grid-polymer>
                </div>
            </div>
    `;
    }

    constructor() {
        super();

        this.gridOptions = {
            context: {
                componentParent: this
            },
            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs(),
            components: {
                moodRenderer: MoodRenderer,
                moodEditor: MoodEditor,
                numericEditor: NumericEditor
            }
        };
    }

    createColumnDefs() {
        return [
            { headerName: 'Name', field: 'name', width: 300 },
            {
                headerName: 'Mood',
                field: 'mood',
                cellRendererFramework: 'mood-renderer',
                cellEditorFramework: 'mood-editor',
                editable: true,
                width: 300
            },
            {
                headerName: 'Numeric',
                field: 'number',
                cellEditorFramework: 'numeric-editor',
                editable: true,
                width: 283
            }
        ];
    }

    createRowData() {
        return [
            { name: 'Bob', mood: 'Happy', number: 10 },
            { name: 'Harry', mood: 'Sad', number: 3 },
            { name: 'Sally', mood: 'Happy', number: 20 },
            { name: 'Mary', mood: 'Sad', number: 5 },
            { name: 'John', mood: 'Happy', number: 15 },
            { name: 'Jack', mood: 'Happy', number: 25 },
            { name: 'Sue', mood: 'Sad', number: 43 },
            { name: 'Sean', mood: 'Sad', number: 1335 },
            { name: 'Niall', mood: 'Happy', number: 2 },
            { name: 'Alberto', mood: 'Happy', number: 123 },
            { name: 'Fred', mood: 'Sad', number: 532 },
            { name: 'Jenny', mood: 'Happy', number: 34 },
            { name: 'Larry', mood: 'Happy', number: 13 },
        ];
    }

    firstDataRendered(params) {
        params.api.sizeColumnsToFit();
    }
}

customElements.define('ag-grid-polymer-example', AgGridPolymerExample);
