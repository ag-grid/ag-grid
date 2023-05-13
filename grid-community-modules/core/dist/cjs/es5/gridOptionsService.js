/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridOptionsService = void 0;
var componentUtil_1 = require("./components/componentUtil");
var context_1 = require("./context/context");
var events_1 = require("./events");
var eventService_1 = require("./eventService");
var function_1 = require("./utils/function");
var generic_1 = require("./utils/generic");
var browser_1 = require("./utils/browser");
var moduleRegistry_1 = require("./modules/moduleRegistry");
var moduleNames_1 = require("./modules/moduleNames");
var gridOptionsValidator_1 = require("./gridOptionsValidator");
function toNumber(value) {
    if (typeof value == 'number') {
        return value;
    }
    if (typeof value == 'string') {
        return parseInt(value, 10);
    }
}
function isTrue(value) {
    return value === true || value === 'true';
}
var GridOptionsService = /** @class */ (function () {
    function GridOptionsService() {
        this.destroyed = false;
        this.domDataKey = '__AG_' + Math.random().toString();
        this.propertyEventService = new eventService_1.EventService();
    }
    Object.defineProperty(GridOptionsService.prototype, "context", {
        // This is quicker then having code call gridOptionsService.get('context')
        get: function () {
            return this.gridOptions['context'];
        },
        enumerable: false,
        configurable: true
    });
    GridOptionsService.prototype.agWire = function (gridApi, columnApi) {
        this.gridOptions.api = gridApi;
        this.gridOptions.columnApi = columnApi;
        this.api = gridApi;
        this.columnApi = columnApi;
    };
    GridOptionsService.prototype.init = function () {
        this.gridOptionLookup = new Set(__spread(componentUtil_1.ComponentUtil.ALL_PROPERTIES, componentUtil_1.ComponentUtil.EVENT_CALLBACKS));
        var async = !this.is('suppressAsyncEvents');
        this.eventService.addGlobalListener(this.globalEventHandler.bind(this), async);
        // sets an initial calculation for the scrollbar width
        this.getScrollbarWidth();
    };
    GridOptionsService.prototype.destroy = function () {
        // need to remove these, as we don't own the lifecycle of the gridOptions, we need to
        // remove the references in case the user keeps the grid options, we want the rest
        // of the grid to be picked up by the garbage collector
        this.gridOptions.api = null;
        this.gridOptions.columnApi = null;
        this.destroyed = true;
    };
    /**
     * Is the given GridOption property set to true.
     * @param property GridOption property that has the type `boolean | undefined`
     */
    GridOptionsService.prototype.is = function (property) {
        return isTrue(this.gridOptions[property]);
    };
    /**
     * Get the raw value of the GridOptions property provided.
     * @param property
     */
    GridOptionsService.prototype.get = function (property) {
        return this.gridOptions[property];
    };
    /**
     * Get the GridOption property as a number, raw value is returned via a toNumber coercion function.
     * @param property GridOption property that has the type `number | undefined`
     */
    GridOptionsService.prototype.getNum = function (property) {
        return toNumber(this.gridOptions[property]);
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
        return generic_1.exists(this.gridOptions[property]);
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
    /**
     *
     * @param key - key of the GridOption property to update
     * @param newValue - new value for this property
     * @param force - force the property change Event to be fired even if the value has not changed
     * @param eventParams - additional params to merge into the property changed event
     */
    GridOptionsService.prototype.set = function (key, newValue, force, eventParams) {
        if (force === void 0) { force = false; }
        if (eventParams === void 0) { eventParams = {}; }
        if (this.gridOptionLookup.has(key)) {
            var previousValue = this.gridOptions[key];
            if (force || previousValue !== newValue) {
                this.gridOptions[key] = newValue;
                var event_1 = __assign({ type: key, currentValue: newValue, previousValue: previousValue }, eventParams);
                this.propertyEventService.dispatchEvent(event_1);
            }
        }
    };
    GridOptionsService.prototype.addEventListener = function (key, listener) {
        this.propertyEventService.addEventListener(key, listener);
    };
    GridOptionsService.prototype.removeEventListener = function (key, listener) {
        this.propertyEventService.removeEventListener(key, listener);
    };
    // responsible for calling the onXXX functions on gridOptions
    GridOptionsService.prototype.globalEventHandler = function (eventName, event) {
        // prevent events from being fired _after_ the grid has been destroyed
        if (this.destroyed) {
            return;
        }
        var callbackMethodName = componentUtil_1.ComponentUtil.getCallbackForEvent(eventName);
        if (typeof this.gridOptions[callbackMethodName] === 'function') {
            this.gridOptions[callbackMethodName](event);
        }
    };
    // *************** Helper methods ************************** //
    // Methods to share common GridOptions related logic that goes above accessing a single property
    // the user might be using some non-standard scrollbar, eg a scrollbar that has zero
    // width and overlays (like the Safari scrollbar, but presented in Chrome). so we
    // allow the user to provide the scroll width before we work it out.
    GridOptionsService.prototype.getScrollbarWidth = function () {
        if (this.scrollbarWidth == null) {
            var useGridOptions = typeof this.gridOptions.scrollbarWidth === 'number' && this.gridOptions.scrollbarWidth >= 0;
            var scrollbarWidth = useGridOptions ? this.gridOptions.scrollbarWidth : browser_1.getScrollbarWidth();
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
            (rowModelType === 'clientSide' && generic_1.missing(this.gridOptions.rowModelType));
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
        return !this.is('suppressAsyncEvents');
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
                    function_1.doOnce(function () { return console.warn('AG Grid: The return of `getRowHeight` cannot be zero. If the intention is to hide rows, use a filter instead.'); }, 'invalidRowHeight');
                }
                return { height: Math.max(1, height), estimated: false };
            }
        }
        if (rowNode.detail && this.is('masterDetail')) {
            return this.getMasterDetailRowHeight();
        }
        var rowHeight = this.gridOptions.rowHeight && this.isNumeric(this.gridOptions.rowHeight) ? this.gridOptions.rowHeight : defaultRowHeight;
        return { height: rowHeight, estimated: false };
    };
    GridOptionsService.prototype.getMasterDetailRowHeight = function () {
        // if autoHeight, we want the height to grow to the new height starting at 1, as otherwise a flicker would happen,
        // as the detail goes to the default (eg 200px) and then immediately shrink up/down to the new measured height
        // (due to auto height) which looks bad, especially if doing row animation.
        if (this.is('detailRowAutoHeight')) {
            return { height: 1, estimated: false };
        }
        if (this.isNumeric(this.gridOptions.detailRowHeight)) {
            return { height: this.gridOptions.detailRowHeight, estimated: false };
        }
        return { height: 300, estimated: false };
    };
    // we don't allow dynamic row height for virtual paging
    GridOptionsService.prototype.getRowHeightAsNumber = function () {
        if (!this.gridOptions.rowHeight || generic_1.missing(this.gridOptions.rowHeight)) {
            return this.environment.getDefaultRowHeight();
        }
        var rowHeight = this.gridOptions.rowHeight;
        if (rowHeight && this.isNumeric(rowHeight)) {
            this.environment.setRowHeightVariable(rowHeight);
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
        if (generic_1.missing(domData)) {
            domData = {};
            element[domDataKey] = domData;
        }
        domData[key] = value;
    };
    GridOptionsService.prototype.getDocument = function () {
        // if user is providing document, we use the users one,
        // otherwise we use the document on the global namespace.
        var result = null;
        if (this.gridOptions.getDocument && generic_1.exists(this.gridOptions.getDocument)) {
            result = this.gridOptions.getDocument();
        }
        else if (this.eGridDiv) {
            result = this.eGridDiv.ownerDocument;
        }
        if (result && generic_1.exists(result)) {
            return result;
        }
        return document;
    };
    GridOptionsService.prototype.getRootNode = function () {
        return this.eGridDiv.getRootNode();
    };
    GridOptionsService.prototype.getRowIdFunc = function () {
        var getRowId = this.getCallback('getRowId');
        if (getRowId) {
            return getRowId;
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        var getRowNodeId = this.gridOptions.getRowNodeId;
        if (getRowNodeId) {
            return function (params) { return getRowNodeId(params.data); };
        }
    };
    GridOptionsService.prototype.getAsyncTransactionWaitMillis = function () {
        return generic_1.exists(this.gridOptions.asyncTransactionWaitMillis) ? this.gridOptions.asyncTransactionWaitMillis : 50;
    };
    GridOptionsService.prototype.isAnimateRows = function () {
        // never allow animating if enforcing the row order
        if (this.is('ensureDomOrder')) {
            return false;
        }
        return this.is('animateRows');
    };
    GridOptionsService.prototype.isTreeData = function () {
        return this.is('treeData') && moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.RowGroupingModule, 'Tree Data');
    };
    GridOptionsService.prototype.isMasterDetail = function () {
        return this.is('masterDetail') && moduleRegistry_1.ModuleRegistry.assertRegistered(moduleNames_1.ModuleNames.MasterDetailModule, 'masterDetail');
    };
    GridOptionsService.prototype.isEnableRangeSelection = function () {
        return this.is('enableRangeSelection') && moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.RangeSelectionModule);
    };
    GridOptionsService.prototype.isColumnsSortingCoupledToGroup = function () {
        var autoGroupColumnDef = this.gridOptions.autoGroupColumnDef;
        var isClientSideRowModel = this.isRowModelType('clientSide');
        return isClientSideRowModel && !(autoGroupColumnDef === null || autoGroupColumnDef === void 0 ? void 0 : autoGroupColumnDef.comparator) && !this.isTreeData();
    };
    GridOptionsService.prototype.getGroupAggFiltering = function () {
        var userValue = this.gridOptions.groupAggFiltering;
        if (typeof userValue === 'function') {
            return this.getCallback('groupAggFiltering');
        }
        if (isTrue(userValue)) {
            return function () { return true; };
        }
        return undefined;
    };
    GridOptionsService.prototype.isGroupMultiAutoColumn = function () {
        if (this.gridOptions.groupDisplayType) {
            return gridOptionsValidator_1.matchesGroupDisplayType('multipleColumns', this.gridOptions.groupDisplayType);
        }
        // if we are doing hideOpenParents we also show multiple columns, otherwise hideOpenParents would not work
        return this.is('groupHideOpenParents');
    };
    GridOptionsService.prototype.isGroupUseEntireRow = function (pivotMode) {
        // we never allow groupDisplayType = 'groupRows' if in pivot mode, otherwise we won't see the pivot values.
        if (pivotMode) {
            return false;
        }
        return this.gridOptions.groupDisplayType ? gridOptionsValidator_1.matchesGroupDisplayType('groupRows', this.gridOptions.groupDisplayType) : false;
    };
    __decorate([
        context_1.Autowired('gridOptions')
    ], GridOptionsService.prototype, "gridOptions", void 0);
    __decorate([
        context_1.Autowired('eventService')
    ], GridOptionsService.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('environment')
    ], GridOptionsService.prototype, "environment", void 0);
    __decorate([
        context_1.Autowired('eGridDiv')
    ], GridOptionsService.prototype, "eGridDiv", void 0);
    __decorate([
        __param(0, context_1.Qualifier('gridApi')), __param(1, context_1.Qualifier('columnApi'))
    ], GridOptionsService.prototype, "agWire", null);
    __decorate([
        context_1.PostConstruct
    ], GridOptionsService.prototype, "init", null);
    __decorate([
        context_1.PreDestroy
    ], GridOptionsService.prototype, "destroy", null);
    GridOptionsService = __decorate([
        context_1.Bean('gridOptionsService')
    ], GridOptionsService);
    return GridOptionsService;
}());
exports.GridOptionsService = GridOptionsService;
