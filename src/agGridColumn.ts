import {autoinject, inlineView, customElement, children, child} from "aurelia-framework";
import {ColDef} from "ag-grid/main";
import {AgCellTemplate, AgEditorTemplate, AgFilterTemplate} from "./agTemplate";
import {generateBindables} from "./agUtils";

@customElement('ag-grid-column')
@generateBindables(['colId','sort','sortedAt','sortingOrder','field','headerValueGetter','hide','pinned','tooltipField','headerTooltip',
    'valueGetter','keyCreator','headerCellRenderer','headerCellTemplate','width','minWidth','maxWidth','cellClass',
    'cellStyle','cellRenderer','cellRendererFramework','cellRendererParams','cellEditor','cellEditorFramework','cellEditorParams',
    'floatingCellRenderer','floatingCellRendererFramework','floatingCellRendererParams','cellFormatter(','floatingCellFormatter',
    'aggFunc','rowGroupIndex','pivotIndex','comparator','checkboxSelection','suppressMenu','suppressSorting','suppressMovable',
    'suppressFilter','unSortIcon','suppressSizeToFit','suppressResize','suppressAutoSize','enableRowGroup','enablePivot',
    'enableValue','editable','suppressNavigable','newValueHandler','volatile','filter','filterFramework','filterParams','cellClassRules',
    'onCellValueChanged','onCellClicked','onCellDoubleClicked','onCellContextMenu','icons','enableCellChangeFlash','headerName',
    'columnGroupShow','headerClass','children','groupId','openByDefault','marryChildren'])
// <slot> is required for @children to work.  https://github.com/aurelia/templating/issues/451#issuecomment-254206622
@inlineView(`<template><slot></slot></template>`)
@autoinject()
export class AgGridColumn {
    @children('ag-grid-column')
    public childColumns:AgGridColumn[] = [];

    @child('ag-cell-template')
    public cellTemplate:AgCellTemplate;

    @child('ag-editor-template')
    public editorTemplate:AgEditorTemplate;

    @child('ag-filter-template')
    public filterTemplate:AgFilterTemplate;

    constructor(){
    }

    public hasChildColumns():boolean {
        return this.childColumns && this.childColumns.length > 0;
    }

    public toColDef():ColDef {
        let colDef:ColDef = this.createColDefFromGridColumn();

        if (this.hasChildColumns()) {
            (<any>colDef)["children"] = AgGridColumn.getChildColDefs(this.childColumns);
        }

        if (this.cellTemplate) {
            colDef.cellRendererFramework = {template: this.cellTemplate.template};
            delete (<any>colDef).cellTemplate;
        }

        if (this.editorTemplate) {
            colDef.editable = true;
            colDef.cellEditorFramework = {template: this.editorTemplate.template};
            delete (<any>colDef).editorTemplate;
        }

        if (this.filterTemplate) {
            colDef.filterFramework = {template: this.filterTemplate.template};
            delete (<any>colDef).filterTemplate;
        }

        return colDef;
    }

    private static getChildColDefs(childColumns:AgGridColumn[]) {
        return childColumns
            .filter(column => !column.hasChildColumns())
            .map((column:AgGridColumn) => {
                return column.toColDef();
            });
    };

    private createColDefFromGridColumn():ColDef {
        let colDef:ColDef = {};
        for (let prop in this) {
            (<any>colDef)[prop] = (<any>this)[prop];
        }
        delete (<any>colDef).childColumns;
        return colDef;
    };
}
