import {Component, Input, ContentChildren, QueryList} from "@angular/core";
import {
    ColDef,
    TextAndNumberFilterParameters,
    ICellEditor,
    ICellRendererFunc,
    ICellRenderer,
    IFilter,
    RowNode,
    IsColumnFunc,
    IAggFunc,
    ColGroupDef,
    GetQuickFilterTextParams,
    ISetFilterParams
} from "ag-grid/main";

@Component({
    selector: 'ag-grid-column',
    template: ''
})
export class AgGridColumn {
    @ContentChildren(AgGridColumn) public childColumns: QueryList<AgGridColumn>;

    public hasChildColumns(): boolean {
        if (this.childColumns && this.childColumns.length > 0) {
            // necessary because of https://github.com/angular/angular/issues/10098
            return !(this.childColumns.length === 1 && this.childColumns.first === this);
        }
        return false;
    }

    public toColDef(): ColDef {
        let colDef: ColDef = this.createColDefFromGridColumn(this);

        if (this.hasChildColumns()) {
            (<any>colDef)["children"] = this.getChildColDefs(this.childColumns);
        }
        return colDef;
    }

    private getChildColDefs(childColumns: QueryList<AgGridColumn>) {
        return childColumns
            // necessary because of https://github.com/angular/angular/issues/10098
            .filter(column => !column.hasChildColumns())
            .map((column: AgGridColumn) => {
                return column.toColDef();
            });
    };

    private createColDefFromGridColumn(from: AgGridColumn): ColDef {
        let colDef: ColDef = {};
        Object.assign(colDef, from);
        delete (<any>colDef).childColumns;
        return colDef;
    };

    // inputs - pretty much most of ColDef, with the exception of template, templateUrl and internal only properties
    @Input() public headerName: string;
    @Input() public columnGroupShow: string;
    @Input() public headerClass: string | string[] | ((params: any) => string | string[]);
    @Input() public toolPanelClass: string | string[] | ((params: any) => string | string[]);
    @Input() public headerValueGetter: string | Function;
    @Input() public pivotKeys: string[];
    @Input() public suppressToolPanel: boolean;

    @Input() public children: (ColDef | ColGroupDef)[];
    @Input() public groupId: string;
    @Input() public openByDefault: boolean;
    @Input() public marryChildren: boolean;

    @Input() public colId: string;
    @Input() public sort: string;
    @Input() public sortedAt: number;
    @Input() public sortingOrder: string[];
    @Input() public field: string;
    @Input() public hide: boolean;
    @Input() public pinned: boolean | string;
    @Input() public tooltipField: string;
    @Input() public headerTooltip: string;
    @Input() public valueGetter: string | Function;
    @Input() public keyCreator: Function;
    @Input() public headerCellRenderer: Function | Object;
    @Input() public headerCellTemplate: ((params: any) => string | HTMLElement) | string | HTMLElement;
    @Input() public width: number;
    @Input() public minWidth: number;
    @Input() public maxWidth: number;
    @Input() public cellClass: string | string[] | ((cellClassParams: any) => string | string[]);
    @Input() public cellStyle: {} | ((params: any) => {});
    @Input() public cellRenderer: {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    @Input() public cellRendererFramework: any;
    @Input() public cellRendererParams: {};
    @Input() public cellEditor: {
        new (): ICellEditor;
    } | string;
    @Input() public cellEditorFramework: any;
    @Input() public cellEditorParams: {};
    @Input() public floatingCellRenderer: {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    @Input() public floatingCellRendererFramework: any;
    @Input() public floatingCellRendererParams: {};
    @Input() public cellFormatter: (params: any) => string;
    @Input() public floatingCellFormatter: (params: any) => string;
    @Input() public aggFunc: string | IAggFunc;
    @Input() public rowGroupIndex: number;
    @Input() public pivotIndex: number;
    @Input() public comparator: (valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isInverted: boolean) => number;
    @Input() public checkboxSelection: boolean | (Function);
    @Input() public suppressMenu: boolean;
    @Input() public suppressSorting: boolean;
    @Input() public suppressMovable: boolean;
    @Input() public suppressFilter: boolean;
    @Input() public unSortIcon: boolean;
    @Input() public suppressSizeToFit: boolean;
    @Input() public suppressResize: boolean;
    @Input() public suppressAutoSize: boolean;
    @Input() public enableRowGroup: boolean;
    @Input() public enablePivot: boolean;
    @Input() public enableValue: boolean;
    @Input() public editable: boolean | IsColumnFunc;
    @Input() public getQuickFilterText: (params: GetQuickFilterTextParams) => string;
    @Input() public suppressNavigable: boolean | IsColumnFunc;
    @Input() public newValueHandler: Function;
    @Input() public volatile: boolean;
    @Input() public filter: string | {
        new (): IFilter;
    };
    @Input() public filterFramework: any;
    @Input() public filterParams: ISetFilterParams | TextAndNumberFilterParameters;
    @Input() public cellClassRules: {
        [cssClassName: string]: (Function | string);
    };
    @Input() public onCellValueChanged: Function;
    @Input() public onCellClicked: Function;
    @Input() public onCellDoubleClicked: Function;
    @Input() public onCellContextMenu: Function;
    @Input() public icons: {
        [key: string]: string;
    };
    @Input() public enableCellChangeFlash: boolean;

    @Input() public headerGroupComponentFramework: {new ():any}
    @Input() public headerGroupComponentParams: any;
    @Input() public headerComponentFramework: {new ():any}
    @Input() public headerComponentParams: any;
}