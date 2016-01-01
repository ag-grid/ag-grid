/// <reference path='componentUtil.ts'/>

// todo:
// + need to hook into destroy callback
// + how can we make this element extend div?

module ag.grid {

    // lets load angular 2 if we can find it
    var _ng: any;

    // we are not using annotations on purpose, as if we do, then there is a runtime dependency
    // on the annotation, which would break this code if angular 2 was not included, which is bad,
    // as angular 2 is optional for ag-grid
    export class AgGridNg2 {

        // not intended for user to interact with. so putting _ in so if use gets reference
        // to this object, they kind'a know it's not part of the agreed interface
        private _agGrid: ag.grid.Grid;
        private _initialised = false;

        private gridOptions: GridOptions;

        private api: GridApi;
        private columnApi: ColumnApi;

        // core grid events
        public modelUpdated = this.newEventEmitter();
        public cellClicked = this.newEventEmitter();
        public cellDoubleClicked = this.newEventEmitter();
        public cellContextMenu = this.newEventEmitter();
        public cellValueChanged = this.newEventEmitter();
        public cellFocused = this.newEventEmitter();
        public rowSelected = this.newEventEmitter();
        public rowDeselected = this.newEventEmitter();
        public selectionChanged = this.newEventEmitter();
        public beforeFilterChanged = this.newEventEmitter();
        public afterFilterChanged = this.newEventEmitter();
        public filterModified = this.newEventEmitter();
        public beforeSortChanged = this.newEventEmitter();
        public afterSortChanged = this.newEventEmitter();
        public virtualRowRemoved = this.newEventEmitter();
        public rowClicked = this.newEventEmitter();
        public rowDoubleClicked = this.newEventEmitter();
        public ready = this.newEventEmitter();

        // column grid events
        public columnEverythingChanged = this.newEventEmitter();
        public columnPivotChanged = this.newEventEmitter();
        public columnValueChanged = this.newEventEmitter();
        public columnMoved = this.newEventEmitter();
        public columnVisible = this.newEventEmitter();
        public columnGroupOpened = this.newEventEmitter();
        public columnResized = this.newEventEmitter();
        public columnPinnedCountChanged = this.newEventEmitter();

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

        // backword compatibility with angular2 alpha
        public onInit(): void {
            this.ngOnInit();
        }

        // this gets called after the directive is initialised
        public ngOnInit(): void {
            this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
            var nativeElement = this.elementDef.nativeElement;
            var globalEventLister = this.globalEventListener.bind(this);
            this._agGrid = new ag.grid.Grid(nativeElement, this.gridOptions, globalEventLister);
            this.api = this.gridOptions.api;
            this.columnApi = this.gridOptions.columnApi;

            this._initialised = true;
        }

        // backword compatibility with angular2 alpha
        public onChanges(changes: any): void {
            this.ngOnChanges(changes);
        }

        public ngOnChanges(changes: any): void {
            ComponentUtil.processOnChange(changes, this.gridOptions, this);
        }

        // backword compatibility with angular2 alpha
        public onDestroy(): void {
            this.ngOnDestroy();
        }

        public ngOnDestroy(): void {
            this.api.destroy();
        }

        private globalEventListener(eventType: string, event: any): void {
            var emitter: any;
            switch (eventType) {
                case Events.EVENT_COLUMN_GROUP_OPENED: emitter = this.columnGroupOpened; break;
                case Events.EVENT_COLUMN_EVERYTHING_CHANGED: emitter = this.columnEverythingChanged; break;
                case Events.EVENT_COLUMN_MOVED: emitter = this.columnMoved; break;
                case Events.EVENT_COLUMN_PINNED_COUNT_CHANGED: emitter = this.columnPinnedCountChanged; break;
                case Events.EVENT_COLUMN_PIVOT_CHANGE: emitter = this.columnPivotChanged; break;
                case Events.EVENT_COLUMN_RESIZED: emitter = this.columnResized; break;
                case Events.EVENT_COLUMN_VALUE_CHANGE: emitter = this.columnValueChanged; break;
                case Events.EVENT_COLUMN_VISIBLE: emitter = this.columnVisible; break;
                case Events.EVENT_MODEL_UPDATED: emitter = this.modelUpdated; break;
                case Events.EVENT_CELL_CLICKED: emitter = this.cellClicked; break;
                case Events.EVENT_CELL_DOUBLE_CLICKED: emitter = this.cellDoubleClicked; break;
                case Events.EVENT_CELL_CONTEXT_MENU: emitter = this.cellContextMenu; break;
                case Events.EVENT_CELL_VALUE_CHANGED: emitter = this.cellValueChanged; break;
                case Events.EVENT_CELL_FOCUSED: emitter = this.cellFocused; break;
                case Events.EVENT_ROW_SELECTED: emitter = this.rowSelected; break;
                case Events.EVENT_ROW_DESELECTED: emitter = this.rowDeselected; break;
                case Events.EVENT_SELECTION_CHANGED: emitter = this.selectionChanged; break;
                case Events.EVENT_BEFORE_FILTER_CHANGED: emitter = this.beforeFilterChanged; break;
                case Events.EVENT_AFTER_FILTER_CHANGED: emitter = this.afterFilterChanged; break;
                case Events.EVENT_AFTER_SORT_CHANGED: emitter = this.afterSortChanged; break;
                case Events.EVENT_BEFORE_SORT_CHANGED: emitter = this.beforeSortChanged; break;
                case Events.EVENT_FILTER_MODIFIED: emitter = this.filterModified; break;
                case Events.EVENT_VIRTUAL_ROW_REMOVED: emitter = this.virtualRowRemoved; break;
                case Events.EVENT_ROW_CLICKED: emitter = this.rowClicked; break;
                case Events.EVENT_ROW_DOUBLE_CLICKED: emitter = this.rowDoubleClicked; break;
                case Events.EVENT_READY: emitter = this.ready; break;
                default:
                    console.log('ag-Grid: AgGridNg2 - unknown event type: ' + eventType);
                    return;
            }
            emitter.next(event);
        }

        private newEventEmitter (): any {
            if( !!_ng.core ) {
                // after angular2 beta
                return new _ng.core.EventEmitter();
            } else {
                // backword compatibillity with angular2 alpha
                return new _ng.EventEmitter();
            }
        }
    }

    // check for angular and component, as if angular 1, we will find angular but the wrong version
    if ((<any> window).ng && (<any> window).ng.Component) {
        var ng = (<any> window).ng;
        initialiseAgGridWithAngular2alpha(ng);
        // check if we are using SystemX
        // taking this out, as it was upsetting people who used SystemX but didn't use Angular2,
        // as it was resulting in a failed 'Fetch' of the Angular2 system
    //} else if ((<any>window).System && (<any>window).System.import) {
    //    (<any>window).System.import('angular2/angular2').then( function(ngFromSystemX: any) {
    //        var ng = ngFromSystemX;
    //        initialiseAgGridWithAngular2(ng);
    //    });
    }
    // if ng.core.Component exists it should be after angular2@2.0.0-beta.0
    else if ((<any> window).ng && (<any> window).ng.core.Component) {
        var ng = (<any> window).ng;
        initialiseAgGridWithAngular2(ng);
    }

    // for backword compatibility
    export function initialiseAgGridWithAngular2alpha(ng: any) {
        _ng = ng;
        (<any>AgGridNg2).annotations = [
            new _ng.Component({
                selector: 'ag-grid-ng2',
                outputs: [
                    // core grid events
                    'modelUpdated', 'cellClicked', 'cellDoubleClicked', 'cellContextMenu', 'cellValueChanged', 'cellFocused',
                    'rowSelected', 'rowDeselected', 'selectionChanged', 'beforeFilterChanged', 'afterFilterChanged',
                    'filterModified', 'beforeSortChanged', 'afterSortChanged', 'virtualRowRemoved',
                    'rowClicked', 'rowDoubleClicked', 'ready',
                    // column events
                    'columnEverythingChanged','columnPivotChanged','columnValueChanged','columnMoved',
                    'columnVisible','columnGroupOpened','columnResized','columnPinnedCountChanged'],
                inputs: ['gridOptions']
                    .concat(ComponentUtil.SIMPLE_PROPERTIES)
                    .concat(ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES)
                    .concat(ComponentUtil.SIMPLE_NUMBER_PROPERTIES)
                    .concat(ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES)
                    .concat(ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES)
                    .concat(ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES)
                    .concat(ComponentUtil.CALLBACKS)
                ,
                compileChildren: false // no angular on the inside thanks
            }),
            new _ng.View({
                template: '',
                // tell angular we don't want view encapsulation, we don't want a shadow root
                encapsulation: _ng.ViewEncapsulation.None
            })
        ];
        (<any>AgGridNg2).parameters = [[_ng.ElementRef]];
    }

    export function initialiseAgGridWithAngular2(ng: any) {

        if( !ng.core ) {
            // backword compatibility with angular2 alpha
            initialiseAgGridWithAngular2alpha(ng);
            return;
        }

        _ng = ng;
        (<any>AgGridNg2).annotations = [
            new _ng.core.Component({
                selector: 'ag-grid-ng2',
                outputs: [
                    // core grid events
                    'modelUpdated', 'cellClicked', 'cellDoubleClicked', 'cellContextMenu', 'cellValueChanged', 'cellFocused',
                    'rowSelected', 'rowDeselected', 'selectionChanged', 'beforeFilterChanged', 'afterFilterChanged',
                    'filterModified', 'beforeSortChanged', 'afterSortChanged', 'virtualRowRemoved',
                    'rowClicked', 'rowDoubleClicked', 'ready',
                    // column events
                    'columnEverythingChanged','columnPivotChanged','columnValueChanged','columnMoved',
                    'columnVisible','columnGroupOpened','columnResized','columnPinnedCountChanged'],
                inputs: ['gridOptions']
                    .concat(ComponentUtil.SIMPLE_PROPERTIES)
                    .concat(ComponentUtil.SIMPLE_BOOLEAN_PROPERTIES)
                    .concat(ComponentUtil.SIMPLE_NUMBER_PROPERTIES)
                    .concat(ComponentUtil.WITH_IMPACT_OTHER_PROPERTIES)
                    .concat(ComponentUtil.WITH_IMPACT_BOOLEAN_PROPERTIES)
                    .concat(ComponentUtil.WITH_IMPACT_NUMBER_PROPERTIES)
                    .concat(ComponentUtil.CALLBACKS)
                ,
                compileChildren: false // no angular on the inside thanks
            }),
            new _ng.core.View({
                template: '',
                // tell angular we don't want view encapsulation, we don't want a shadow root
                encapsulation: _ng.core.ViewEncapsulation.None
            })
        ];
        (<any>AgGridNg2).parameters = [[_ng.core.ElementRef]];
    }
}
