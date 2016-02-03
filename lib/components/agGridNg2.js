/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.2.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
// lets load angular 2 if we can find it
var grid_1 = require("../grid");
var componentUtil_1 = require("./componentUtil");
var events_1 = require("../events");
var _ng;
// we are not using annotations on purpose, as if we do, then there is a runtime dependency
// on the annotation, which would break this code if angular 2 was not included, which is bad,
// as angular 2 is optional for ag-grid
var AgGridNg2 = (function () {
    function AgGridNg2(elementDef) {
        this.elementDef = elementDef;
        this._initialised = false;
        // core grid events
        this.modelUpdated = new _ng.core.EventEmitter();
        this.cellClicked = new _ng.core.EventEmitter();
        this.cellDoubleClicked = new _ng.core.EventEmitter();
        this.cellContextMenu = new _ng.core.EventEmitter();
        this.cellValueChanged = new _ng.core.EventEmitter();
        this.cellFocused = new _ng.core.EventEmitter();
        this.rowSelected = new _ng.core.EventEmitter();
        this.rowDeselected = new _ng.core.EventEmitter();
        this.selectionChanged = new _ng.core.EventEmitter();
        this.beforeFilterChanged = new _ng.core.EventEmitter();
        this.afterFilterChanged = new _ng.core.EventEmitter();
        this.filterModified = new _ng.core.EventEmitter();
        this.beforeSortChanged = new _ng.core.EventEmitter();
        this.afterSortChanged = new _ng.core.EventEmitter();
        this.virtualRowRemoved = new _ng.core.EventEmitter();
        this.rowClicked = new _ng.core.EventEmitter();
        this.rowDoubleClicked = new _ng.core.EventEmitter();
        this.ready = new _ng.core.EventEmitter();
        this.gridSizeChanged = new _ng.core.EventEmitter();
        this.rowGroupOpened = new _ng.core.EventEmitter();
        // column grid events
        this.columnEverythingChanged = new _ng.core.EventEmitter();
        this.columnRowGroupChanged = new _ng.core.EventEmitter();
        this.columnValueChanged = new _ng.core.EventEmitter();
        this.columnMoved = new _ng.core.EventEmitter();
        this.columnVisible = new _ng.core.EventEmitter();
        this.columnGroupOpened = new _ng.core.EventEmitter();
        this.columnResized = new _ng.core.EventEmitter();
        this.columnPinnedCountChanged = new _ng.core.EventEmitter();
    }
    // this gets called after the directive is initialised
    AgGridNg2.prototype.ngOnInit = function () {
        this.gridOptions = componentUtil_1.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        var nativeElement = this.elementDef.nativeElement;
        var globalEventLister = this.globalEventListener.bind(this);
        this._agGrid = new grid_1.Grid(nativeElement, this.gridOptions, globalEventLister);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
        this._initialised = true;
    };
    AgGridNg2.prototype.ngOnChanges = function (changes) {
        if (this._initialised) {
            componentUtil_1.ComponentUtil.processOnChange(changes, this.gridOptions, this.api);
        }
    };
    AgGridNg2.prototype.ngOnDestroy = function () {
        this.api.destroy();
    };
    AgGridNg2.prototype.globalEventListener = function (eventType, event) {
        var emitter;
        switch (eventType) {
            case events_1.Events.EVENT_ROW_GROUP_OPENED:
                emitter = this.rowGroupOpened;
                break;
            case events_1.Events.EVENT_COLUMN_GROUP_OPENED:
                emitter = this.columnGroupOpened;
                break;
            case events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED:
                emitter = this.columnEverythingChanged;
                break;
            case events_1.Events.EVENT_COLUMN_MOVED:
                emitter = this.columnMoved;
                break;
            case events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE:
                emitter = this.columnRowGroupChanged;
                break;
            case events_1.Events.EVENT_COLUMN_RESIZED:
                emitter = this.columnResized;
                break;
            case events_1.Events.EVENT_COLUMN_VALUE_CHANGE:
                emitter = this.columnValueChanged;
                break;
            case events_1.Events.EVENT_COLUMN_VISIBLE:
                emitter = this.columnVisible;
                break;
            case events_1.Events.EVENT_MODEL_UPDATED:
                emitter = this.modelUpdated;
                break;
            case events_1.Events.EVENT_CELL_CLICKED:
                emitter = this.cellClicked;
                break;
            case events_1.Events.EVENT_CELL_DOUBLE_CLICKED:
                emitter = this.cellDoubleClicked;
                break;
            case events_1.Events.EVENT_CELL_CONTEXT_MENU:
                emitter = this.cellContextMenu;
                break;
            case events_1.Events.EVENT_CELL_VALUE_CHANGED:
                emitter = this.cellValueChanged;
                break;
            case events_1.Events.EVENT_CELL_FOCUSED:
                emitter = this.cellFocused;
                break;
            case events_1.Events.EVENT_ROW_SELECTED:
                emitter = this.rowSelected;
                break;
            case events_1.Events.EVENT_ROW_DESELECTED:
                emitter = this.rowDeselected;
                break;
            case events_1.Events.EVENT_SELECTION_CHANGED:
                emitter = this.selectionChanged;
                break;
            case events_1.Events.EVENT_BEFORE_FILTER_CHANGED:
                emitter = this.beforeFilterChanged;
                break;
            case events_1.Events.EVENT_AFTER_FILTER_CHANGED:
                emitter = this.afterFilterChanged;
                break;
            case events_1.Events.EVENT_AFTER_SORT_CHANGED:
                emitter = this.afterSortChanged;
                break;
            case events_1.Events.EVENT_BEFORE_SORT_CHANGED:
                emitter = this.beforeSortChanged;
                break;
            case events_1.Events.EVENT_FILTER_MODIFIED:
                emitter = this.filterModified;
                break;
            case events_1.Events.EVENT_VIRTUAL_ROW_REMOVED:
                emitter = this.virtualRowRemoved;
                break;
            case events_1.Events.EVENT_ROW_CLICKED:
                emitter = this.rowClicked;
                break;
            case events_1.Events.EVENT_ROW_DOUBLE_CLICKED:
                emitter = this.rowDoubleClicked;
                break;
            case events_1.Events.EVENT_READY:
                emitter = this.ready;
                break;
            case events_1.Events.EVENT_GRID_SIZE_CHANGED:
                emitter = this.ready;
                break;
            default:
                console.log('ag-Grid: AgGridNg2 - unknown event type: ' + eventType);
                return;
        }
        emitter.next(event);
    };
    return AgGridNg2;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AgGridNg2;
// check for angular and component, as if angular 1, we will find angular but the wrong version
if (typeof (window) !== 'undefined') {
    if (window && window.ng && window.ng.core && window.ng.core.Component) {
        var ng = window.ng;
        initialiseAgGridWithAngular2(ng);
    }
}
function initialiseAgGridWithAngular2(ng) {
    _ng = ng;
    AgGridNg2.annotations = [
        new _ng.core.Component({
            selector: 'ag-grid-ng2',
            outputs: componentUtil_1.ComponentUtil.EVENTS,
            inputs: componentUtil_1.ComponentUtil.ALL_PROPERTIES.concat(['gridOptions']),
            compileChildren: false // no angular on the inside thanks
        }),
        new _ng.core.View({
            template: '',
            // tell angular we don't want view encapsulation, we don't want a shadow root
            encapsulation: _ng.core.ViewEncapsulation.None
        })
    ];
    AgGridNg2.parameters = [[_ng.core.ElementRef]];
}
exports.initialiseAgGridWithAngular2 = initialiseAgGridWithAngular2;
