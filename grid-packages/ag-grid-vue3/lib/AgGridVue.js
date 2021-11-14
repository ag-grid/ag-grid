var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
import { h } from 'vue';
import { Options, Vue } from 'vue-class-component';
import { Bean, ComponentUtil, Grid } from 'ag-grid-community';
import { VueFrameworkComponentWrapper } from './VueFrameworkComponentWrapper';
import { getAgGridProperties, kebabNameToAttrEventName, kebabProperty } from './Utils';
import { AgGridColumn } from './AgGridColumn';
import { markRaw, toRaw } from '@vue/reactivity';
import { VueFrameworkOverrides } from './VueFrameworkOverrides';
var _a = getAgGridProperties(), props = _a[0], watch = _a[1], model = _a[2];
var AgGridVue = /** @class */ (function (_super) {
    __extends(AgGridVue, _super);
    function AgGridVue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gridCreated = false;
        _this.isDestroyed = false;
        _this.gridReadyFired = false;
        _this.emitRowModel = null;
        return _this;
    }
    AgGridVue_1 = AgGridVue;
    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    AgGridVue.prototype.render = function () {
        return h('div');
    };
    AgGridVue.prototype.globalEventListener = function (eventType, event) {
        if (this.isDestroyed) {
            return;
        }
        if (eventType === 'gridReady') {
            this.gridReadyFired = true;
        }
        this.updateModelIfUsed(eventType);
    };
    AgGridVue.prototype.processChanges = function (propertyName, currentValue, previousValue) {
        if (this.gridCreated) {
            if (this.skipChange(propertyName, currentValue, previousValue)) {
                return;
            }
            var changes = {};
            changes[propertyName] = {
                // decouple the rowdata - if we don't when the grid changes rowdata directly that'll trigger this component to react to rowData changes,
                // which can reset grid state (ie row selection)
                currentValue: propertyName === 'rowData' ? (Object.isFrozen(currentValue) ? currentValue : markRaw(toRaw(currentValue))) : currentValue,
                previousValue: previousValue,
            };
            ComponentUtil.processOnChange(changes, this.gridOptions, this.gridOptions.api, this.gridOptions.columnApi);
        }
    };
    // noinspection JSUnusedGlobalSymbols
    AgGridVue.prototype.mounted = function () {
        var _this = this;
        // we debounce the model update to prevent a flood of updates in the event there are many individual
        // cell/row updates
        this.emitRowModel = this.debounce(function () {
            _this.$emit(AgGridVue_1.DATA_MODEL_ATTR_NAME, Object.freeze(_this.getRowData()));
        }, 20);
        var frameworkComponentWrapper = new VueFrameworkComponentWrapper(this);
        // the gridOptions we pass to the grid don't need to be reactive (and shouldn't be - it'll cause issues
        // with mergeDeep for example
        var gridOptions = markRaw(ComponentUtil.copyAttributesToGridOptions(toRaw(this.gridOptions), this));
        this.checkForBindingConflicts();
        var rowData = this.getRowDataBasedOnBindings();
        gridOptions.rowData = rowData ? (Object.isFrozen(rowData) ? rowData : markRaw(toRaw(rowData))) : rowData;
        if (AgGridColumn.hasChildColumns(this.$slots)) {
            gridOptions.columnDefs = AgGridColumn.mapChildColumnDefs(this.$slots);
        }
        var gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkOverrides: new VueFrameworkOverrides(this),
            providedBeanInstances: {
                frameworkComponentWrapper: frameworkComponentWrapper,
            },
            modules: this.modules,
        };
        new Grid(this.$el, gridOptions, gridParams);
        this.gridCreated = true;
    };
    AgGridVue.prototype.destroyed = function () {
        if (this.gridCreated) {
            if (this.gridOptions.api) {
                this.gridOptions.api.destroy();
            }
            this.isDestroyed = true;
        }
    };
    AgGridVue.prototype.unmounted = function () {
        this.destroyed();
    };
    AgGridVue.prototype.checkForBindingConflicts = function () {
        var thisAsAny = this;
        if ((thisAsAny.rowData || this.gridOptions.rowData) &&
            thisAsAny.rowDataModel) {
            console.warn('ag-grid: Using both rowData and rowDataModel. rowData will be ignored.');
        }
    };
    AgGridVue.prototype.getRowData = function () {
        var rowData = [];
        this.gridOptions.api.forEachNode(function (rowNode) {
            rowData.push(rowNode.data);
        });
        return rowData;
    };
    AgGridVue.prototype.updateModelIfUsed = function (eventType) {
        if (this.gridReadyFired &&
            this.$attrs[AgGridVue_1.DATA_MODEL_ATTR_NAME] &&
            AgGridVue_1.ROW_DATA_EVENTS.indexOf(eventType) !== -1) {
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
    /*
     * Prevents an infinite loop when using v-model for the rowData
     */
    AgGridVue.prototype.skipChange = function (propertyName, currentValue, previousValue) {
        if (this.gridReadyFired &&
            propertyName === 'rowData' &&
            this.$attrs[AgGridVue_1.DATA_MODEL_ATTR_NAME]) {
            if (currentValue === previousValue) {
                return true;
            }
            if (currentValue && previousValue) {
                var currentRowData = currentValue;
                var previousRowData = previousValue;
                if (currentRowData.length === previousRowData.length) {
                    for (var i = 0; i < currentRowData.length; i++) {
                        if (currentRowData[i] !== previousRowData[i]) {
                            return false;
                        }
                    }
                    return true;
                }
            }
        }
        return false;
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
    AgGridVue.VERSION = 'Vue 3+';
    AgGridVue.ROW_DATA_EVENTS = ['rowDataChanged', 'rowDataUpdated', 'cellValueChanged', 'rowValueChanged'];
    AgGridVue.DATA_MODEL_ATTR_NAME = kebabNameToAttrEventName(kebabProperty('data-model-changed'));
    AgGridVue = AgGridVue_1 = __decorate([
        Bean('agGridVue'),
        Options({
            props: props,
            watch: watch,
            model: model,
        })
    ], AgGridVue);
    return AgGridVue;
}(Vue));
export { AgGridVue };
