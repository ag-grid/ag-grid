import { Grid, ColDef, GridOptions, ICellRendererComp, ICellRendererParams, KeyCreatorParams, } from '@ag-grid-community/core'

import { GenderRenderer } from './genderRenderer_typescript'
import { NumericEditor } from './numericEditor_typescript'
import { MoodRenderer } from './moodRenderer_typescript'
import { MoodEditor } from './moodEditor_typescript'

class CountryCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `${params.value.name}`;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}


const columnDefs: ColDef[] = [
    { field: 'first_name', headerName: 'First Name', width: 120, editable: true },
    { field: 'last_name', headerName: 'Last Name', width: 120, editable: true },
    {
        field: 'gender',
        width: 100,
        editable: true,
        cellRendererComp: GenderRenderer,
        cellEditorComp: 'agRichSelectCellEditor',
        cellEditorPopup: true,
        cellEditorCompParams: {
            cellRendererComp: GenderRenderer,
            values: ['Male', 'Female'],
        },
    },
    {
        field: 'age',
        width: 80,
        editable: true,
        cellEditorComp: NumericEditor,
        cellEditorPopup: true
    },
    {
        field: 'mood',
        width: 100,
        cellRendererComp: MoodRenderer,
        cellEditorComp: MoodEditor,
        cellEditorPopup: true,
        editable: true,
    },
    {
        field: 'country',
        width: 110,
        cellEditorComp: 'agRichSelectCellEditor',
        cellEditorPopup: true,
        cellRendererComp: CountryCellRenderer,
        keyCreator: function (params: KeyCreatorParams) {
            return params.value.name
        },
        cellEditorCompParams: {
            cellRendererComp: CountryCellRenderer,
            values: [
                { name: 'Ireland', code: 'IE' },
                { name: 'UK', code: 'UK' },
                { name: 'France', code: 'FR' },
            ],
        },
        editable: true,
    },
    {
        field: 'address',
        editable: true,
        cellEditorComp: 'agLargeTextCellEditor',
        cellEditorCompParams: {
            maxLength: '300', // override the editor defaults
            cols: '50',
            rows: '6',
        },
    },
]

const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    rowData: getData(),
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
    },
    onRowEditingStarted: event => {
        console.log('never called - not doing row editing')
    },
    onRowEditingStopped: event => {
        console.log('never called - not doing row editing')
    },
    onCellEditingStarted: event => {
        console.log('cellEditingStarted')
    },
    onCellEditingStopped: event => {
        console.log('cellEditingStopped')
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    new Grid(gridDiv, gridOptions)
})
