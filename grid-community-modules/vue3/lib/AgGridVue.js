import { defineComponent, getCurrentInstance, h } from 'vue';
import { markRaw, toRaw } from '@vue/reactivity';
import { ComponentUtil, createGrid, Events } from '@ag-grid-community/core';
import { getAgGridProperties } from './Utils';
import { VueFrameworkComponentWrapper } from './VueFrameworkComponentWrapper';
import { VueFrameworkOverrides } from './VueFrameworkOverrides';
const ROW_DATA_EVENTS = new Set(['rowDataUpdated', 'cellValueChanged', 'rowValueChanged']);
const ALWAYS_SYNC_GLOBAL_EVENTS = new Set([Events.EVENT_GRID_PRE_DESTROYED]);
const DATA_MODEL_ATTR_NAME = 'onUpdate:modelValue'; // emit name would be update:ModelValue
const DATA_MODEL_EMIT_NAME = 'update:modelValue';
const [props, computed, watch] = getAgGridProperties();
export const AgGridVue = defineComponent({
    render() {
        return h('div');
    },
    props: Object.assign({ gridOptions: {
            type: Object,
            default: () => ({}),
        }, autoParamsRefresh: {
            type: Boolean,
            default: () => false,
        }, componentDependencies: {
            type: Array,
            default: () => [],
        }, plugins: [], modules: {
            type: Array,
            default: () => [],
        }, modelValue: {
            type: Array,
            default: undefined,
            required: false
        } }, props),
    data() {
        return {
            api: undefined,
            gridCreated: false,
            isDestroyed: false,
            gridReadyFired: false,
            emitRowModel: undefined
        };
    },
    computed,
    watch,
    methods: {
        globalEventListenerFactory(restrictToSyncOnly) {
            return (eventType, event) => {
                if (this.isDestroyed) {
                    return;
                }
                if (eventType === 'gridReady') {
                    this.gridReadyFired = true;
                }
                const alwaysSync = ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType);
                if ((alwaysSync && !restrictToSyncOnly) || (!alwaysSync && restrictToSyncOnly)) {
                    return;
                }
                this.updateModelIfUsed(eventType);
            };
        },
        processChanges(propertyName, currentValue, previousValue) {
            if (this.gridCreated) {
                if (this.skipChange(propertyName, currentValue, previousValue)) {
                    return;
                }
                const options = {
                    [propertyName]: propertyName === 'rowData' ? (Object.isFrozen(currentValue) ? currentValue : markRaw(toRaw(currentValue))) : currentValue,
                };
                // decouple the row data - if we don't when the grid changes row data directly that'll trigger this component to react to rowData changes,
                // which can reset grid state (ie row selection)
                ComponentUtil.processOnChange(options, this.api);
            }
        },
        checkForBindingConflicts() {
            const thisAsAny = this;
            if ((thisAsAny.rowData || this.gridOptions.rowData) &&
                thisAsAny.modelValue) {
                console.warn('AG Grid: Using both rowData and v-model. rowData will be ignored.');
            }
        },
        getRowData() {
            var _a;
            const rowData = [];
            (_a = this.api) === null || _a === void 0 ? void 0 : _a.forEachNode((rowNode) => {
                rowData.push(rowNode.data);
            });
            return rowData;
        },
        updateModelIfUsed(eventType) {
            if (this.gridReadyFired &&
                this.$attrs[DATA_MODEL_ATTR_NAME] &&
                ROW_DATA_EVENTS.has(eventType)) {
                if (this.emitRowModel) {
                    this.emitRowModel();
                }
            }
        },
        getRowDataBasedOnBindings() {
            const thisAsAny = this;
            const rowData = thisAsAny.modelValue;
            return rowData ? rowData :
                thisAsAny.rowData ? thisAsAny.rowData : thisAsAny.gridOptions.rowData;
        },
        getProvides() {
            let instance = getCurrentInstance();
            let provides = {};
            while (instance) {
                if (instance && instance.provides) {
                    provides = Object.assign(Object.assign({}, provides), instance.provides);
                }
                instance = instance.parent;
            }
            return provides;
        },
        /*
        * Prevents an infinite loop when using v-model for the rowData
        */
        skipChange(propertyName, currentValue, previousValue) {
            if (this.gridReadyFired &&
                propertyName === 'rowData' &&
                this.$attrs[DATA_MODEL_ATTR_NAME]) {
                if (currentValue === previousValue) {
                    return true;
                }
                if (currentValue && previousValue) {
                    const currentRowData = currentValue;
                    const previousRowData = previousValue;
                    if (currentRowData.length === previousRowData.length) {
                        for (let i = 0; i < currentRowData.length; i++) {
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
        debounce(func, delay) {
            let timeout;
            return () => {
                const later = function () {
                    func();
                };
                window.clearTimeout(timeout);
                timeout = window.setTimeout(later, delay);
            };
        }
    },
    mounted() {
        // we debounce the model update to prevent a flood of updates in the event there are many individual
        // cell/row updates
        this.emitRowModel = this.debounce(() => {
            this.$emit(DATA_MODEL_EMIT_NAME, Object.freeze(this.getRowData()));
        }, 20);
        const provides = this.getProvides();
        const frameworkComponentWrapper = new VueFrameworkComponentWrapper(this, provides);
        // the gridOptions we pass to the grid don't need to be reactive (and shouldn't be - it'll cause issues
        // with mergeDeep for example
        const gridOptions = markRaw(ComponentUtil.combineAttributesAndGridOptions(toRaw(this.gridOptions), this));
        this.checkForBindingConflicts();
        const rowData = this.getRowDataBasedOnBindings();
        if (rowData !== ComponentUtil.VUE_OMITTED_PROPERTY) {
            gridOptions.rowData = rowData ? (Object.isFrozen(rowData) ? rowData : markRaw(toRaw(rowData))) : rowData;
        }
        const gridParams = {
            globalEventListener: this.globalEventListenerFactory().bind(this),
            globalSyncEventListener: this.globalEventListenerFactory(true).bind(this),
            frameworkOverrides: new VueFrameworkOverrides(this),
            providedBeanInstances: {
                frameworkComponentWrapper,
            },
            modules: this.modules,
        };
        this.api = createGrid(this.$el, gridOptions, gridParams);
        this.gridCreated = true;
    },
    unmounted() {
        var _a;
        if (this.gridCreated) {
            (_a = this.api) === null || _a === void 0 ? void 0 : _a.destroy();
            this.isDestroyed = true;
        }
    }
});
