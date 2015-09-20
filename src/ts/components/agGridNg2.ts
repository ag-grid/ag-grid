/// <reference path='componentUtil.ts'/>

// todo:
// + need to hook into destroy callback
// + how can we make this element extend div?

module awk.grid {

    function toBoolean(value: any): boolean {
        if (typeof value === 'boolean') {
            return value;
        } else if (typeof value === 'string') {
            // for boolean, compare to empty String to allow attributes appearing with
            // not value to be treated as 'true'
            return value.toUpperCase() === 'TRUE' || value=='';
        } else {
            return false;
        }
    }

    function toNumber(value: any): number {
        if (typeof value === 'number') {
            return value;
        } else if (typeof value === 'string') {
            return Number(value);
        } else {
            return undefined;
        }
    }

    // we are not using annotations on purpose, as if we do, then there is a runtime dependency
    // on the annotation, which would break this code if angular 2 was not included, which is bad,
    // as angular 2 is optional for ag-grid
    export class AgGridDirective {

        // not intended for user to interact with. so putting _ in so if use gets reference
        // to this object, they kind'a know it's not part of the agreed interface
        private _agGrid: awk.grid.Grid;
        private _initialised = false;

        private gridOptions: GridOptions;

        private api: GridApi;
        private columnApi: ColumnApi;

        // core grid events
        public modelUpdated = new ng.EventEmitter();
        public cellClicked = new ng.EventEmitter();
        public cellDoubleClicked = new ng.EventEmitter();
        public cellContextMenu = new ng.EventEmitter();
        public cellValueChanged = new ng.EventEmitter();
        public cellFocused = new ng.EventEmitter();
        public rowSelected = new ng.EventEmitter();
        public selectionChanged = new ng.EventEmitter();
        public beforeFilterChanged = new ng.EventEmitter();
        public afterFilterChanged = new ng.EventEmitter();
        public filterModified = new ng.EventEmitter();
        public beforeSortChanged = new ng.EventEmitter();
        public afterSortChanged = new ng.EventEmitter();
        public virtualRowRemoved = new ng.EventEmitter();
        public rowClicked = new ng.EventEmitter();
        public ready = new ng.EventEmitter();

        // column grid events
        public columnEverythingChanged = new ng.EventEmitter();
        public columnPivotChanged = new ng.EventEmitter();
        public columnValueChanged = new ng.EventEmitter();
        public columnMoved = new ng.EventEmitter();
        public columnVisible = new ng.EventEmitter();
        public columnGroupOpened = new ng.EventEmitter();
        public columnResized = new ng.EventEmitter();
        public columnPinnedCountChanged = new ng.EventEmitter();

        // properties
        public virtualPaging: boolean;
        public toolPanelSuppressPivot: boolean;
        public toolPanelSuppressValues: boolean;
        public rowsAlreadyGrouped: boolean;
        public suppressRowClickSelection: boolean;
        public suppressCellSelection: boolean;
        public sortingOrder: string[];
        public suppressMultiSort: boolean;
        public suppressHorizontalScroll: boolean;
        public unSortIcon: boolean;
        public rowHeight: number;
        public rowBuffer: number;
        public enableColResize: boolean;
        public enableCellExpressions: boolean;
        public enableSorting: boolean;
        public enableServerSideSorting: boolean;
        public enableFilter: boolean;
        public enableServerSideFilter: boolean;
        public colWidth: number;
        public suppressMenuHide: boolean;
        public debug: boolean;
        public icons: any; // should be typed
        public angularCompileRows: boolean;
        public angularCompileFilters: boolean;
        public angularCompileHeaders: boolean;
        public localeText: any;
        public localeTextFunc: Function;

        public groupSuppressAutoColumn: boolean;
        public groupSelectsChildren: boolean;
        public groupHidePivotColumns: boolean;
        public groupIncludeFooter: boolean;
        public groupUseEntireRow: boolean;
        public groupSuppressRow: boolean;
        public groupSuppressBlankHeader: boolean;
        public groupColumnDef: any; // change to typed
        public forPrint: boolean;

        // changeable, but no immediate impact
        public context: any;
        public rowStyle: any;
        public rowClass: any;
        public headerCellRenderer: any;
        public groupDefaultExpanded: any;
        public slaveGrids: GridOptions[];
        public rowSelection: string;
        public rowDeselection: boolean;

        // changeable with impact
        public rowData: any[]; // should this be immutable for ag2?
        public floatingTopRowData: any[]; // should this be immutable ag2?
        public floatingBottomRowData: any[]; // should this be immutable ag2?
        public showToolPanel: boolean;
        public groupKeys: string[];
        public groupAggFunction: (nodes: any[]) => void;
        public groupAggFields: string[];
        public columnDefs: any[]; // change to typed
        public datasource: any; // should be typed
        public pinnedColumnCount: number;
        public quickFilterText: string;
        // in properties
        public groupHeaders: boolean;
        public headerHeight: number;

        constructor(private elementDef: any) {
        }

        private initGridOptions(): void {
            // create empty grid options if none were passed
            if (typeof this.gridOptions !== 'object') {
                this.gridOptions = <GridOptions> {};
            }
            // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
            var pThis = <any>this;
            var pGridOptions = <any>this.gridOptions;
            // add in all the simple properties
            ComponentUtil.SIMPLE_PROPERTIES.concat(ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES).concat(ComponentUtil.CALLBACKS).forEach( (key)=> {
                if (typeof (pThis)[key] !== 'undefined') {
                    pGridOptions[key] = pThis[key];
                }
            });
            ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES.concat(ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES).forEach( (key)=> {
                if (typeof (pThis)[key] !== 'undefined') {
                    pGridOptions[key] = toBoolean(pThis[key]);
                }
            });
            ComponentUtil.SIMPLE_NUMBER_PROPERTIES.concat(ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES).forEach( (key)=> {
                if (typeof (pThis)[key] !== 'undefined') {
                    pGridOptions[key] = toNumber(pThis[key]);
                }
            });
        }

        // this gets called after the directive is initialised
        public onInit(): void {
            this.initGridOptions();
            var nativeElement = this.elementDef.nativeElement;
            this._agGrid = new awk.grid.Grid(nativeElement, this.gridOptions, this.genericEventListener.bind(this));
            this.api = this.gridOptions.api;
            this.columnApi = this.gridOptions.columnApi;
            this.columnApi.addChangeListener(this.columnEventListener.bind(this));
            this._initialised = true;
        }

        public onChange(changes: any): void {
            if (!this._initialised || !changes) { return; }

            // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
            //var pThis = <any>this;
            var pGridOptions = <any>this.gridOptions;

            // check if any change for the simple types, and if so, then just copy in the new value
            ComponentUtil.SIMPLE_PROPERTIES.forEach( (key)=> {
                if (changes[key]) {
                    pGridOptions[key] = changes[key].currentValue;
                }
            });
            ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES.forEach( (key)=> {
                if (changes[key]) {
                    pGridOptions[key] = toBoolean(changes[key].currentValue);
                }
            });
            ComponentUtil.SIMPLE_NUMBER_PROPERTIES.forEach( (key)=> {
                if (changes[key]) {
                    pGridOptions[key] = toNumber(changes[key].currentValue);
                }
            });

            if (changes.showToolPanel) {
                this.api.showToolPanel(this.showToolPanel);
            }

            if (changes.quickFilterText) {
                this.api.setQuickFilter(this.quickFilterText);
            }

            if (changes.rowData) {
                this.api.setRows(this.rowData);
            }

            if (changes.floatingTopRowData) {
                this.api.setFloatingTopRowData(this.floatingTopRowData);
            }

            if (changes.floatingBottomRowData) {
                this.api.setFloatingBottomRowData(this.floatingBottomRowData);
            }

            if (changes.columnDefs) {
                this.api.setColumnDefs(this.columnDefs);
            }

            if (changes.datasource) {
                this.api.setDatasource(this.datasource);
            }

            if (changes.pinnedColumnCount) {
                this.columnApi.setPinnedColumnCount(this.pinnedColumnCount);
            }

            if (changes.pinnedColumnCount) {
                this.columnApi.setPinnedColumnCount(this.pinnedColumnCount);
            }

            if (changes.groupHeaders) {
                this.api.setGroupHeaders(this.groupHeaders);
            }

            if (changes.headerHeight) {
                this.api.setHeaderHeight(this.headerHeight);
            }

            // need to review these, they are not impacting anything, they should
            // call something on the API to update the grid
            if (changes.groupKeys) {
                this.gridOptions.groupKeys = this.groupKeys;
            }
            if (changes.groupAggFunction) {
                this.gridOptions.groupAggFunction = this.groupAggFunction;
            }
            if (changes.groupAggFields) {
                this.gridOptions.groupAggFields = this.groupAggFields;
            }
        }

        private columnEventListener(event: ColumnChangeEvent): void {
            var emitter: any;
            switch (event.getType()) {
                case ColumnChangeEvent.TYPE_COLUMN_GROUP_OPENED: emitter = this.columnGroupOpened; break;
                case ColumnChangeEvent.TYPE_COLUMN_EVERYTHING_CHANGED: emitter = this.columnEverythingChanged; break;
                case ColumnChangeEvent.TYPE_COLUMN_MOVED: emitter = this.columnMoved; break;
                case ColumnChangeEvent.TYPE_COLUMN_PINNED_COUNT_CHANGED: emitter = this.columnPinnedCountChanged; break;
                case ColumnChangeEvent.TYPE_COLUMN_PIVOT_CHANGE: emitter = this.columnPivotChanged; break;
                case ColumnChangeEvent.TYPE_COLUMN_RESIZED: emitter = this.columnResized; break;
                case ColumnChangeEvent.TYPE_COLUMN_VALUE_CHANGE: emitter = this.columnValueChanged; break;
                case ColumnChangeEvent.TYPE_COLUMN_VISIBLE: emitter = this.columnVisible; break;
                default:
                    console.log('ag-Grid: AgGridDirective - unknown event type: ' + event);
                    return;
            }
            emitter.next(event);
        }

        private genericEventListener(eventName: string, event: any): void {
            var emitter: any;
            switch (eventName) {
                case Constants.EVENT_MODEL_UPDATED: emitter = this.modelUpdated; break;
                case Constants.EVENT_CELL_CLICKED: emitter = this.cellClicked; break;
                case Constants.EVENT_CELL_DOUBLE_CLICKED: emitter = this.cellDoubleClicked; break;
                case Constants.EVENT_CELL_CONTEXT_MENU: emitter = this.cellContextMenu; break;
                case Constants.EVENT_CELL_VALUE_CHANGED: emitter = this.cellValueChanged; break;
                case Constants.EVENT_CELL_FOCUSED: emitter = this.cellFocused; break;
                case Constants.EVENT_ROW_SELECTED: emitter = this.rowSelected; break;
                case Constants.EVENT_SELECTION_CHANGED: emitter = this.selectionChanged; break;
                case Constants.EVENT_BEFORE_FILTER_CHANGED: emitter = this.beforeFilterChanged; break;
                case Constants.EVENT_AFTER_FILTER_CHANGED: emitter = this.afterFilterChanged; break;
                case Constants.EVENT_AFTER_SORT_CHANGED: emitter = this.afterSortChanged; break;
                case Constants.EVENT_BEFORE_SORT_CHANGED: emitter = this.beforeSortChanged; break;
                case Constants.EVENT_FILTER_MODIFIED: emitter = this.filterModified; break;
                case Constants.EVENT_VIRTUAL_ROW_REMOVED: emitter = this.virtualRowRemoved; break;
                case Constants.EVENT_ROW_CLICKED: emitter = this.rowClicked; break;
                case Constants.EVENT_READY: emitter = this.ready; break;
                default:
                    console.log('ag-Grid: AgGridDirective - unknown event type: ' + eventName);
                    return;
            }

            // not all the grid events have data, but angular 2 requires some object to be the
            // event, so put in an empty object if missing the event.
            if (event===null || event===undefined) {
                event = {};
            }

            emitter.next(event);
        }

    }


    // provide a reference to angular
    var ng = (<any> window).ng;
    // check for angular and component, as if angular 1, we will find angular but the wrong version
    if (ng && ng.Component) {
        (<any>AgGridDirective).annotations = [
            new ng.Component({
                selector: 'ag-grid-ng2',
                events: [
                    // core grid events
                    'modelUpdated', 'cellClicked', 'cellDoubleClicked', 'cellContextMenu', 'cellValueChanged', 'cellFocused',
                    'rowSelected', 'selectionChanged', 'beforeFilterChanged', 'afterFilterChanged',
                    'filterModified', 'beforeSortChanged', 'afterSortChanged', 'virtualRowRemoved',
                    'rowClicked','ready',
                    // column events
                    'columnEverythingChanged','columnPivotChanged','columnValueChanged','columnMoved',
                    'columnVisible','columnGroupOpened','columnResized','columnPinnedCountChanged'],
                properties: ['gridOptions']
                    .concat(ComponentUtil.SIMPLE_PROPERTIES)
                    .concat(ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES)
                    .concat(ComponentUtil.SIMPLE_NUMBER_PROPERTIES)
                    .concat(ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES)
                    .concat(ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES)
                    .concat(ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES)
                    .concat(ComponentUtil.CALLBACKS)
                ,
                compileChildren: false, // no angular on the inside thanks
                lifecycle: [ng.LifecycleEvent.onInit, ng.LifecycleEvent.onChange]
            }),
        new ng.View({
                template: '',
                // tell angular we don't want view encapsulation, we don't want a shadow root
                encapsulation: ng.ViewEncapsulation.None
            })
        ];
        (<any>AgGridDirective).parameters = [[ng.ElementRef]];
    }

}
