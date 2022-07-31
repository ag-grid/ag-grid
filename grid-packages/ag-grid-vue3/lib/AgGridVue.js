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
import { defineComponent, h } from 'vue';
import { markRaw, toRaw } from '@vue/reactivity';
import { ComponentUtil, Grid } from 'ag-grid-community';
import { VueFrameworkComponentWrapper } from './VueFrameworkComponentWrapper';
import { getAgGridProperties } from './Utils';
import { AgGridColumn } from './AgGridColumn';
import { VueFrameworkOverrides } from './VueFrameworkOverrides';
var ROW_DATA_EVENTS = ['rowDataChanged', 'rowDataUpdated', 'cellValueChanged', 'rowValueChanged'];
var DATA_MODEL_ATTR_NAME = 'onUpdate:modelValue'; // emit name would be update:ModelValue
var DATA_MODEL_EMIT_NAME = 'update:modelValue';
var _a = getAgGridProperties(), props = _a[0], watch = _a[1];
export var AgGridVue = defineComponent({
    render: function () {
        return h('div');
    },
    props: __assign({ gridOptions: {
            type: Object,
            default: function () { return ({}); },
        }, autoParamsRefresh: {
            type: Boolean,
            default: function () { return false; },
        }, componentDependencies: {
            type: Array,
            default: function () { return []; },
        }, plugins: [], modules: {
            type: Array,
            default: function () { return []; },
        }, modelValue: {
            type: Array,
            default: undefined,
            required: false
        } }, props),
    data: function () {
        return {
            gridCreated: false,
            isDestroyed: false,
            gridReadyFired: false,
            emitRowModel: undefined
        };
    },
    watch: __assign({ modelValue: {
            handler: function (currentValue, previousValue) {
                this.processChanges('rowData', currentValue, previousValue);
            },
            deep: true
        } }, watch),
    methods: {
        globalEventListener: function (eventType, event) {
            if (this.isDestroyed) {
                return;
            }
            if (eventType === 'gridReady') {
                this.gridReadyFired = true;
            }
            this.updateModelIfUsed(eventType);
        },
        processChanges: function (propertyName, currentValue, previousValue) {
            if (this.gridCreated) {
                if (this.skipChange(propertyName, currentValue, previousValue)) {
                    return;
                }
                var changes = {};
                changes[propertyName] = {
                    // decouple the row data - if we don't when the grid changes row data directly that'll trigger this component to react to rowData changes,
                    // which can reset grid state (ie row selection)
                    currentValue: propertyName === 'rowData' ? (Object.isFrozen(currentValue) ? currentValue : markRaw(toRaw(currentValue))) : currentValue,
                    previousValue: previousValue,
                };
                ComponentUtil.processOnChange(changes, this.gridOptions, this.gridOptions.api, this.gridOptions.columnApi);
            }
        },
        checkForBindingConflicts: function () {
            var thisAsAny = this;
            if ((thisAsAny.rowData || this.gridOptions.rowData) &&
                thisAsAny.modelValue) {
                console.warn('AG Grid: Using both rowData and v-model. rowData will be ignored.');
            }
        },
        getRowData: function () {
            var rowData = [];
            this.gridOptions.api.forEachNode(function (rowNode) {
                rowData.push(rowNode.data);
            });
            return rowData;
        },
        updateModelIfUsed: function (eventType) {
            if (this.gridReadyFired &&
                this.$attrs[DATA_MODEL_ATTR_NAME] &&
                ROW_DATA_EVENTS.indexOf(eventType) !== -1) {
                if (this.emitRowModel) {
                    this.emitRowModel();
                }
            }
        },
        getRowDataBasedOnBindings: function () {
            var thisAsAny = this;
            var rowData = thisAsAny.modelValue;
            return rowData ? rowData :
                thisAsAny.rowData ? thisAsAny.rowData : thisAsAny.gridOptions.rowData;
        },
        /*
        * Prevents an infinite loop when using v-model for the rowData
        */
        skipChange: function (propertyName, currentValue, previousValue) {
            if (this.gridReadyFired &&
                propertyName === 'rowData' &&
                this.$attrs[DATA_MODEL_ATTR_NAME]) {
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
        },
        debounce: function (func, delay) {
            var timeout;
            return function () {
                var later = function () {
                    func();
                };
                window.clearTimeout(timeout);
                timeout = window.setTimeout(later, delay);
            };
        }
    },
    mounted: function () {
        var _this = this;
        // we debounce the model update to prevent a flood of updates in the event there are many individual
        // cell/row updates
        this.emitRowModel = this.debounce(function () {
            _this.$emit(DATA_MODEL_EMIT_NAME, Object.freeze(_this.getRowData()));
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
    },
    unmounted: function () {
        if (this.gridCreated) {
            if (this.gridOptions.api) {
                this.gridOptions.api.destroy();
            }
            this.isDestroyed = true;
        }
    }
});
//# sourceMappingURL=AgGridVue.js.map