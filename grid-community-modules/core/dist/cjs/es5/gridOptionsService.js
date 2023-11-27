"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridOptionsService = void 0;
var columnApi_1 = require("./columns/columnApi");
var componentUtil_1 = require("./components/componentUtil");
var context_1 = require("./context/context");
var events_1 = require("./events");
var eventService_1 = require("./eventService");
var propertyKeys_1 = require("./propertyKeys");
var function_1 = require("./utils/function");
var generic_1 = require("./utils/generic");
var browser_1 = require("./utils/browser");
var gridOptionsValidations_1 = require("./validation/rules/gridOptionsValidations");
var GridOptionsService = /** @class */ (function () {
    function GridOptionsService() {
        var _this = this;
        this.destroyed = false;
        this.domDataKey = '__AG_' + Math.random().toString();
        this.propertyEventService = new eventService_1.EventService();
        // responsible for calling the onXXX functions on gridOptions
        // It forces events defined in GridOptionsService.alwaysSyncGlobalEvents to be fired synchronously.
        // This is required for events such as GridPreDestroyed.
        // Other events can be fired asynchronously or synchronously depending on config.
        this.globalEventHandlerFactory = function (restrictToSyncOnly) {
            return function (eventName, event) {
                // prevent events from being fired _after_ the grid has been destroyed
                if (_this.destroyed) {
                    return;
                }
                var alwaysSync = GridOptionsService_1.alwaysSyncGlobalEvents.has(eventName);
                if ((alwaysSync && !restrictToSyncOnly) || (!alwaysSync && restrictToSyncOnly)) {
                    return;
                }
                var callbackMethodName = componentUtil_1.ComponentUtil.getCallbackForEvent(eventName);
                if (typeof _this.gridOptions[callbackMethodName] === 'function') {
                    _this.gridOptions[callbackMethodName](event);
                }
            };
        };
    }
    GridOptionsService_1 = GridOptionsService;
    Object.defineProperty(GridOptionsService.prototype, "context", {
        // This is quicker then having code call gridOptionsService.get('context')
        get: function () {
            return this.gridOptions['context'];
        },
        enumerable: false,
        configurable: true
    });
    GridOptionsService.prototype.init = function () {
        this.columnApi = new columnApi_1.ColumnApi(this.api);
        var async = !this.get('suppressAsyncEvents');
        this.eventService.addGlobalListener(this.globalEventHandlerFactory().bind(this), async);
        this.eventService.addGlobalListener(this.globalEventHandlerFactory(true).bind(this), false);
        // sets an initial calculation for the scrollbar width
        this.getScrollbarWidth();
    };
    GridOptionsService.prototype.destroy = function () {
        this.destroyed = true;
        this.columnApi = undefined;
    };
    /**
     * Get the raw value of the GridOptions property provided.
     * @param property
     */
    GridOptionsService.prototype.get = function (property) {
        var _a;
        return (_a = this.gridOptions[property]) !== null && _a !== void 0 ? _a : gridOptionsValidations_1.GRID_OPTION_DEFAULTS[property];
    };
    /**
     * Get the GridOption callback but wrapped so that the common params of api,columnApi and context are automatically applied to the params.
     * @param property GridOption callback properties based on the fact that this property has a callback with params extending AgGridCommon
     */
    GridOptionsService.prototype.getCallback = function (property) {
        return this.mergeGridCommonParams(this.gridOptions[property]);
    };
    /**
     * Returns `true` if a value has been specified for this GridOption.
     * @param property GridOption property
     */
    GridOptionsService.prototype.exists = function (property) {
        return (0, generic_1.exists)(this.gridOptions[property]);
    };
    /**
    * Wrap the user callback and attach the api, columnApi and context to the params object on the way through.
    * @param callback User provided callback
    * @returns Wrapped callback where the params object not require api, columnApi and context
    */
    GridOptionsService.prototype.mergeGridCommonParams = function (callback) {
        var _this = this;
        if (callback) {
            var wrapped = function (callbackParams) {
                var mergedParams = callbackParams;
                mergedParams.api = _this.api;
                mergedParams.columnApi = _this.columnApi;
                mergedParams.context = _this.context;
                return callback(mergedParams);
            };
            return wrapped;
        }
        return callback;
    };
    GridOptionsService.toBoolean = function (value) {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            // for boolean, compare to empty String to allow attributes appearing with
            // no value to be treated as 'true'
            return value.toUpperCase() === 'TRUE' || value == '';
        }
        return false;
    };
    GridOptionsService.toNumber = function (value) {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            var parsed = parseInt(value);
            if (isNaN(parsed)) {
                return undefined;
            }
            return parsed;
        }
        return undefined;
    };
    GridOptionsService.toConstrainedNum = function (min, max) {
        return function (value) {
            var num = GridOptionsService_1.toNumber(value);
            if (num == null || num < min || num > max) {
                return undefined; // return undefined if outside bounds, this will then be coerced to the default value.
            }
            return num;
        };
    };
    GridOptionsService.getCoercedValue = function (key, value) {
        var coerceFunc = GridOptionsService_1.PROPERTY_COERCIONS.get(key);
        if (!coerceFunc) {
            return value;
        }
        return coerceFunc(value);
    };
    GridOptionsService.getCoercedGridOptions = function (gridOptions) {
        var newGo = {};
        Object.entries(gridOptions).forEach(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            var coercedValue = GridOptionsService_1.getCoercedValue(key, value);
            newGo[key] = coercedValue;
        });
        return newGo;
    };
    GridOptionsService.prototype.updateGridOptions = function (_a) {
        var _this = this;
        var options = _a.options, _b = _a.source, source = _b === void 0 ? 'api' : _b;
        var changeSet = { id: GridOptionsService_1.changeSetId++, properties: [] };
        // all events are fired after grid options has finished updating.
        var events = [];
        Object.entries(options).forEach(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            if (source === 'api' && propertyKeys_1.INITIAL_GRID_OPTION_KEYS[key]) {
                (0, function_1.warnOnce)("".concat(key, " is an initial property and cannot be updated."));
            }
            var coercedValue = GridOptionsService_1.getCoercedValue(key, value);
            var shouldForce = (typeof coercedValue) === 'object' && source === 'api'; // force objects as they could have been mutated.
            var previousValue = _this.gridOptions[key];
            if (shouldForce || previousValue !== coercedValue) {
                _this.gridOptions[key] = coercedValue;
                var event_1 = {
                    type: key,
                    currentValue: coercedValue,
                    previousValue: previousValue,
                    changeSet: changeSet,
                    source: source
                };
                events.push(event_1);
            }
        });
        this.validationService.processGridOptions(this.gridOptions);
        // changeSet should just include the properties that have changed.
        changeSet.properties = events.map(function (event) { return event.type; });
        events.forEach(function (event) {
            if (_this.gridOptions.debug) {
                console.log("AG Grid: Updated property ".concat(event.type, " from ").concat(String(event.previousValue), " to ").concat(String(event.currentValue), "."));
            }
            _this.propertyEventService.dispatchEvent(event);
        });
    };
    GridOptionsService.prototype.addEventListener = function (key, listener) {
        this.propertyEventService.addEventListener(key, listener);
    };
    GridOptionsService.prototype.removeEventListener = function (key, listener) {
        this.propertyEventService.removeEventListener(key, listener);
    };
    // *************** Helper methods ************************** //
    // Methods to share common GridOptions related logic that goes above accessing a single property
    GridOptionsService.prototype.getGridId = function () {
        return this.api.getGridId();
    };
    // the user might be using some non-standard scrollbar, eg a scrollbar that has zero
    // width and overlays (like the Safari scrollbar, but presented in Chrome). so we
    // allow the user to provide the scroll width before we work it out.
    GridOptionsService.prototype.getScrollbarWidth = function () {
        if (this.scrollbarWidth == null) {
            var useGridOptions = typeof this.gridOptions.scrollbarWidth === 'number' && this.gridOptions.scrollbarWidth >= 0;
            var scrollbarWidth = useGridOptions ? this.gridOptions.scrollbarWidth : (0, browser_1.getScrollbarWidth)();
            if (scrollbarWidth != null) {
                this.scrollbarWidth = scrollbarWidth;
                this.eventService.dispatchEvent({
                    type: events_1.Events.EVENT_SCROLLBAR_WIDTH_CHANGED
                });
            }
        }
        return this.scrollbarWidth;
    };
    GridOptionsService.prototype.isRowModelType = function (rowModelType) {
        return this.gridOptions.rowModelType === rowModelType ||
            (rowModelType === 'clientSide' && (0, generic_1.missing)(this.gridOptions.rowModelType));
    };
    GridOptionsService.prototype.isDomLayout = function (domLayout) {
        var _a;
        var gridLayout = (_a = this.gridOptions.domLayout) !== null && _a !== void 0 ? _a : 'normal';
        return gridLayout === domLayout;
    };
    GridOptionsService.prototype.isRowSelection = function () {
        return this.gridOptions.rowSelection === 'single' || this.gridOptions.rowSelection === 'multiple';
    };
    GridOptionsService.prototype.useAsyncEvents = function () {
        return !this.get('suppressAsyncEvents');
    };
    GridOptionsService.prototype.isGetRowHeightFunction = function () {
        return typeof this.gridOptions.getRowHeight === 'function';
    };
    GridOptionsService.prototype.getRowHeightForNode = function (rowNode, allowEstimate, defaultRowHeight) {
        if (allowEstimate === void 0) { allowEstimate = false; }
        if (defaultRowHeight == null) {
            defaultRowHeight = this.environment.getDefaultRowHeight();
        }
        // check the function first, in case use set both function and
        // number, when using virtual pagination then function can be
        // used for pinned rows and the number for the body rows.
        if (this.isGetRowHeightFunction()) {
            if (allowEstimate) {
                return { height: defaultRowHeight, estimated: true };
            }
            var params = {
                node: rowNode,
                data: rowNode.data
            };
            var height = this.getCallback('getRowHeight')(params);
            if (this.isNumeric(height)) {
                if (height === 0) {
                    (0, function_1.warnOnce)('The return of `getRowHeight` cannot be zero. If the intention is to hide rows, use a filter instead.');
                }
                return { height: Math.max(1, height), estimated: false };
            }
        }
        if (rowNode.detail && this.get('masterDetail')) {
            return this.getMasterDetailRowHeight();
        }
        var rowHeight = this.gridOptions.rowHeight && this.isNumeric(this.gridOptions.rowHeight) ? this.gridOptions.rowHeight : defaultRowHeight;
        return { height: rowHeight, estimated: false };
    };
    GridOptionsService.prototype.getMasterDetailRowHeight = function () {
        // if autoHeight, we want the height to grow to the new height starting at 1, as otherwise a flicker would happen,
        // as the detail goes to the default (eg 200px) and then immediately shrink up/down to the new measured height
        // (due to auto height) which looks bad, especially if doing row animation.
        if (this.get('detailRowAutoHeight')) {
            return { height: 1, estimated: false };
        }
        if (this.isNumeric(this.gridOptions.detailRowHeight)) {
            return { height: this.gridOptions.detailRowHeight, estimated: false };
        }
        return { height: 300, estimated: false };
    };
    // we don't allow dynamic row height for virtual paging
    GridOptionsService.prototype.getRowHeightAsNumber = function () {
        if (!this.gridOptions.rowHeight || (0, generic_1.missing)(this.gridOptions.rowHeight)) {
            return this.environment.getDefaultRowHeight();
        }
        var rowHeight = this.environment.refreshRowHeightVariable();
        if (rowHeight !== -1) {
            return rowHeight;
        }
        console.warn('AG Grid row height must be a number if not using standard row model');
        return this.environment.getDefaultRowHeight();
    };
    GridOptionsService.prototype.isNumeric = function (value) {
        return !isNaN(value) && typeof value === 'number' && isFinite(value);
    };
    GridOptionsService.prototype.getDomDataKey = function () {
        return this.domDataKey;
    };
    // returns the dom data, or undefined if not found
    GridOptionsService.prototype.getDomData = function (element, key) {
        var domData = element[this.getDomDataKey()];
        return domData ? domData[key] : undefined;
    };
    GridOptionsService.prototype.setDomData = function (element, key, value) {
        var domDataKey = this.getDomDataKey();
        var domData = element[domDataKey];
        if ((0, generic_1.missing)(domData)) {
            domData = {};
            element[domDataKey] = domData;
        }
        domData[key] = value;
    };
    GridOptionsService.prototype.getDocument = function () {
        // if user is providing document, we use the users one,
        // otherwise we use the document on the global namespace.
        var result = null;
        if (this.gridOptions.getDocument && (0, generic_1.exists)(this.gridOptions.getDocument)) {
            result = this.gridOptions.getDocument();
        }
        else if (this.eGridDiv) {
            result = this.eGridDiv.ownerDocument;
        }
        if (result && (0, generic_1.exists)(result)) {
            return result;
        }
        return document;
    };
    GridOptionsService.prototype.getWindow = function () {
        var eDocument = this.getDocument();
        return eDocument.defaultView || window;
    };
    GridOptionsService.prototype.getRootNode = function () {
        return this.eGridDiv.getRootNode();
    };
    GridOptionsService.prototype.getAsyncTransactionWaitMillis = function () {
        return (0, generic_1.exists)(this.gridOptions.asyncTransactionWaitMillis) ? this.gridOptions.asyncTransactionWaitMillis : 50;
    };
    GridOptionsService.prototype.isAnimateRows = function () {
        // never allow animating if enforcing the row order
        if (this.get('ensureDomOrder')) {
            return false;
        }
        return this.get('animateRows');
    };
    GridOptionsService.prototype.isGroupRowsSticky = function () {
        if (this.get('suppressGroupRowsSticky') ||
            this.get('paginateChildRows') ||
            this.get('groupHideOpenParents')) {
            return false;
        }
        return true;
    };
    GridOptionsService.prototype.isColumnsSortingCoupledToGroup = function () {
        var autoGroupColumnDef = this.gridOptions.autoGroupColumnDef;
        return !(autoGroupColumnDef === null || autoGroupColumnDef === void 0 ? void 0 : autoGroupColumnDef.comparator) && !this.get('treeData');
    };
    GridOptionsService.prototype.getGroupAggFiltering = function () {
        var userValue = this.gridOptions.groupAggFiltering;
        if (typeof userValue === 'function') {
            return this.getCallback('groupAggFiltering');
        }
        if (userValue === true) {
            return function () { return true; };
        }
        return undefined;
    };
    GridOptionsService.prototype.isGroupIncludeFooterTrueOrCallback = function () {
        var userValue = this.gridOptions.groupIncludeFooter;
        return userValue === true || typeof userValue === 'function';
    };
    GridOptionsService.prototype.getGroupIncludeFooter = function () {
        var userValue = this.gridOptions.groupIncludeFooter;
        if (typeof userValue === 'function') {
            return this.getCallback('groupIncludeFooter');
        }
        if (userValue === true) {
            return function () { return true; };
        }
        return function () { return false; };
    };
    GridOptionsService.prototype.isGroupMultiAutoColumn = function () {
        if (this.gridOptions.groupDisplayType) {
            return this.gridOptions.groupDisplayType === 'multipleColumns';
        }
        // if we are doing hideOpenParents we also show multiple columns, otherwise hideOpenParents would not work
        return this.get('groupHideOpenParents');
    };
    GridOptionsService.prototype.isGroupUseEntireRow = function (pivotMode) {
        // we never allow groupDisplayType = 'groupRows' if in pivot mode, otherwise we won't see the pivot values.
        if (pivotMode) {
            return false;
        }
        return this.gridOptions.groupDisplayType === 'groupRows';
    };
    var GridOptionsService_1;
    GridOptionsService.alwaysSyncGlobalEvents = new Set([events_1.Events.EVENT_GRID_PRE_DESTROYED]);
    /**
     * Handles value coercion including validation of ranges etc. If value is invalid, undefined is set, allowing default to be used.
     */
    GridOptionsService.PROPERTY_COERCIONS = new Map(__spreadArray(__spreadArray(__spreadArray([], __read(propertyKeys_1.PropertyKeys.BOOLEAN_PROPERTIES.map(function (key) { return [key, GridOptionsService_1.toBoolean]; })), false), __read(propertyKeys_1.PropertyKeys.NUMBER_PROPERTIES.map(function (key) { return [key, GridOptionsService_1.toNumber]; })), false), [
        ['groupAggFiltering', function (val) { return typeof val === 'function' ? val : GridOptionsService_1.toBoolean(val); }],
        ['pageSize', GridOptionsService_1.toConstrainedNum(1, Number.MAX_VALUE)],
        ['autoSizePadding', GridOptionsService_1.toConstrainedNum(0, Number.MAX_VALUE)],
        ['keepDetailRowsCount', GridOptionsService_1.toConstrainedNum(1, Number.MAX_VALUE)],
        ['rowBuffer', GridOptionsService_1.toConstrainedNum(0, Number.MAX_VALUE)],
        ['infiniteInitialRowCount', GridOptionsService_1.toConstrainedNum(1, Number.MAX_VALUE)],
        ['cacheOverflowSize', GridOptionsService_1.toConstrainedNum(1, Number.MAX_VALUE)],
        ['cacheBlockSize', GridOptionsService_1.toConstrainedNum(1, Number.MAX_VALUE)],
        ['serverSideInitialRowCount', GridOptionsService_1.toConstrainedNum(1, Number.MAX_VALUE)],
        ['viewportRowModelPageSize', GridOptionsService_1.toConstrainedNum(1, Number.MAX_VALUE)],
        ['viewportRowModelBufferSize', GridOptionsService_1.toConstrainedNum(0, Number.MAX_VALUE)],
    ], false));
    GridOptionsService.changeSetId = 0;
    __decorate([
        (0, context_1.Autowired)('gridOptions')
    ], GridOptionsService.prototype, "gridOptions", void 0);
    __decorate([
        (0, context_1.Autowired)('eventService')
    ], GridOptionsService.prototype, "eventService", void 0);
    __decorate([
        (0, context_1.Autowired)('environment')
    ], GridOptionsService.prototype, "environment", void 0);
    __decorate([
        (0, context_1.Autowired)('eGridDiv')
    ], GridOptionsService.prototype, "eGridDiv", void 0);
    __decorate([
        (0, context_1.Autowired)('validationService')
    ], GridOptionsService.prototype, "validationService", void 0);
    __decorate([
        (0, context_1.Autowired)('gridApi')
    ], GridOptionsService.prototype, "api", void 0);
    __decorate([
        context_1.PostConstruct
    ], GridOptionsService.prototype, "init", null);
    __decorate([
        context_1.PreDestroy
    ], GridOptionsService.prototype, "destroy", null);
    GridOptionsService = GridOptionsService_1 = __decorate([
        (0, context_1.Bean)('gridOptionsService')
    ], GridOptionsService);
    return GridOptionsService;
}());
exports.GridOptionsService = GridOptionsService;
