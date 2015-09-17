// todo:
// + need to hook into destroy callback
// + how can we make this element extend div?

module awk.grid {

    // we are not using annotations on purpose, as if we do, then there is a runtime dependency
    // on the annotation, which would break this code if angular 2 was not included, which is bad,
    // as angular 2 is optional for ag-grid
    export class AgGridDirective {

        private _gridOptions: GridOptions;
        private _agGrid: awk.grid.Grid;

        private api: GridApi;
        private columnApi: ColumnApi;

        // core grid events
        public modelUpdated = new ng.EventEmitter();
        public cellClicked = new ng.EventEmitter();
        public cellDoubleClicked = new ng.EventEmitter();
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

        constructor(private elementDef: any) {
            console.log('constructor');
        }

        set gridOptions(gridOptions: GridOptions) {
            this._gridOptions = gridOptions;
            var nativeElement = this.elementDef.nativeElement;
            this._agGrid = new awk.grid.Grid(nativeElement, gridOptions, this.genericEventListener.bind(this));
            this.api = this._gridOptions.api;
            this.columnApi = this._gridOptions.columnApi;
            this.columnApi.addChangeListener(this.columnEventListener.bind(this));
        }

        set quickFilterText(text: string) {
            this._gridOptions.api.setQuickFilter(text);
        }

        public onInit() {
            console.log('onInit');
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
                selector: 'ag-grid-a2',
                events: [
                    // core grid events
                    'modelUpdated', 'cellClicked', 'cellDoubleClicked', 'cellValueChanged', 'cellFocused',
                    'rowSelected', 'selectionChanged', 'beforeFilterChanged', 'afterFilterChanged',
                    'filterModified', 'beforeSortChanged', 'afterSortChanged', 'virtualRowRemoved',
                    'rowClicked','ready',
                    // column events
                    'columnEverythingChanged','columnPivotChanged','columnValueChanged','columnMoved',
                    'columnVisible','columnGroupOpened','columnResized','columnPinnedCountChanged'],
                properties: ['gridOptions','quickFilterText','soup'],
                compileChildren: false, // no angular on the inside thanks
                lifecycle: [ng.LifecycleEvent.onInit]
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
