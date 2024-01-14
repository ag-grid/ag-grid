var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Bean, ComponentUtil, Events, createGrid } from 'ag-grid-community';
import { VueFrameworkComponentWrapper } from './VueFrameworkComponentWrapper';
import { getAgGridProperties } from './Utils';
import { VueFrameworkOverrides } from './VueFrameworkOverrides';
var _a = getAgGridProperties(), props = _a[0], computed = _a[1], watch = _a[2], model = _a[3];
var AgGridVue = /** @class */ (function (_super) {
    __extends(AgGridVue, _super);
    function AgGridVue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gridCreated = false;
        _this.isDestroyed = false;
        _this.gridReadyFired = false;
        _this.api = undefined;
        _this.emitRowModel = null;
        return _this;
    }
    AgGridVue_1 = AgGridVue;
    AgGridVue.kebabProperty = function (property) {
        return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    };
    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    AgGridVue.prototype.render = function (h) {
        return h('div');
    };
    // It forces events defined in AgGridVue.ALWAYS_SYNC_GLOBAL_EVENTS to be fired synchronously.
    // This is required for events such as GridPreDestroyed.
    // Other events are fired can be fired asynchronously or synchronously depending on config.
    AgGridVue.prototype.globalEventListenerFactory = function (restrictToSyncOnly) {
        var _this = this;
        return function (eventType, event) {
            if (_this.isDestroyed) {
                return;
            }
            if (eventType === 'gridReady') {
                _this.gridReadyFired = true;
            }
            var alwaysSync = AgGridVue_1.ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType);
            if ((alwaysSync && !restrictToSyncOnly) || (!alwaysSync && restrictToSyncOnly)) {
                return;
            }
            _this.updateModelIfUsed(eventType);
            // only emit if someone is listening
            // we allow both kebab and camelCase event listeners, so check for both
            var kebabName = AgGridVue_1.kebabProperty(eventType);
            if (_this.$listeners[kebabName]) {
                _this.$emit(kebabName, event);
            }
            else if (_this.$listeners[eventType]) {
                _this.$emit(eventType, event);
            }
        };
    };
    // noinspection JSUnusedGlobalSymbols
    AgGridVue.prototype.mounted = function () {
        var _this = this;
        // we debounce the model update to prevent a flood of updates in the event there are many individual
        // cell/row updates
        this.emitRowModel = this.debounce(function () {
            _this.$emit('data-model-changed', Object.freeze(_this.getRowData()));
        }, 20);
        var frameworkComponentWrapper = new VueFrameworkComponentWrapper(this);
        var gridOptions = ComponentUtil.combineAttributesAndGridOptions(this.gridOptions, this);
        this.checkForBindingConflicts();
        var rowData = this.getRowDataBasedOnBindings();
        if (rowData !== ComponentUtil.VUE_OMITTED_PROPERTY) {
            gridOptions.rowData = rowData;
        }
        var gridParams = {
            globalEventListener: this.globalEventListenerFactory().bind(this),
            globalSyncEventListener: this.globalEventListenerFactory(true).bind(this),
            frameworkOverrides: new VueFrameworkOverrides(this),
            providedBeanInstances: {
                frameworkComponentWrapper: frameworkComponentWrapper,
            },
            modules: this.modules,
        };
        this.api = createGrid(this.$el, gridOptions, gridParams);
        this.gridCreated = true;
    };
    // noinspection JSUnusedGlobalSymbols
    AgGridVue.prototype.destroyed = function () {
        var _a;
        if (this.gridCreated) {
            (_a = this.api) === null || _a === void 0 ? void 0 : _a.destroy();
            this.isDestroyed = true;
        }
    };
    AgGridVue.prototype.checkForBindingConflicts = function () {
        var thisAsAny = this;
        if ((thisAsAny.rowData || this.gridOptions.rowData) &&
            thisAsAny.rowDataModel) {
            console.warn('AG Grid: Using both rowData and rowDataModel. rowData will be ignored.');
        }
    };
    AgGridVue.prototype.getRowData = function () {
        var _a;
        var rowData = [];
        (_a = this.api) === null || _a === void 0 ? void 0 : _a.forEachNode(function (rowNode) {
            rowData.push(rowNode.data);
        });
        return rowData;
    };
    AgGridVue.prototype.updateModelIfUsed = function (eventType) {
        if (this.gridReadyFired &&
            this.$listeners['data-model-changed'] &&
            AgGridVue_1.ROW_DATA_EVENTS.has(eventType)) {
            if (this.emitRowModel) {
                this.emitRowModel();
            }
        }
    };
    AgGridVue.prototype.getRowDataBasedOnBindings = function () {
        var thisAsAny = this;
        var rowDataModel = thisAsAny.rowDataModel;
        return rowDataModel ? rowDataModel :
            thisAsAny.rowData ? thisAsAny.rowData : thisAsAny.gridOptions.rowData;
    };
    AgGridVue.prototype.debounce = function (func, delay) {
        var timeout;
        return function () {
            var later = function () {
                func();
            };
            window.clearTimeout(timeout);
            timeout = window.setTimeout(later, delay);
        };
    };
    var AgGridVue_1;
    AgGridVue.ROW_DATA_EVENTS = new Set(['rowDataUpdated', 'cellValueChanged', 'rowValueChanged']);
    AgGridVue.ALWAYS_SYNC_GLOBAL_EVENTS = new Set([Events.EVENT_GRID_PRE_DESTROYED]);
    __decorate([
        Prop(Boolean)
    ], AgGridVue.prototype, "autoParamsRefresh", void 0);
    __decorate([
        Prop({ default: function () { return []; } })
    ], AgGridVue.prototype, "componentDependencies", void 0);
    __decorate([
        Prop({ default: function () { return []; } })
    ], AgGridVue.prototype, "modules", void 0);
    AgGridVue = AgGridVue_1 = __decorate([
        Bean('agGridVue'),
        Component({
            props: props,
            computed: computed,
            watch: watch,
            model: model,
        })
    ], AgGridVue);
    return AgGridVue;
}(Vue));
export { AgGridVue };
