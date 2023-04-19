import { defineComponent, getCurrentInstance, h } from 'vue';
import { markRaw, toRaw } from '@vue/reactivity';
import { ComponentUtil, Grid } from 'ag-grid-community';
import { VueFrameworkComponentWrapper } from './VueFrameworkComponentWrapper';
import { getAgGridProperties } from './Utils';
import { VueFrameworkOverrides } from './VueFrameworkOverrides';
const ROW_DATA_EVENTS = ['rowDataChanged', 'rowDataUpdated', 'cellValueChanged', 'rowValueChanged'];
const DATA_MODEL_ATTR_NAME = 'onUpdate:modelValue'; // emit name would be update:ModelValue
const DATA_MODEL_EMIT_NAME = 'update:modelValue';
const [props, watch] = getAgGridProperties();
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
            gridCreated: false,
            isDestroyed: false,
            gridReadyFired: false,
            emitRowModel: undefined
        };
    },
    watch: Object.assign({ modelValue: {
            handler(currentValue, previousValue) {
                this.processChanges('rowData', currentValue, previousValue);
            },
            deep: true
        } }, watch),
    methods: {
        globalEventListener(eventType, event) {
            if (this.isDestroyed) {
                return;
            }
            if (eventType === 'gridReady') {
                this.gridReadyFired = true;
            }
            this.updateModelIfUsed(eventType);
        },
        processChanges(propertyName, currentValue, previousValue) {
            if (this.gridCreated) {
                if (this.skipChange(propertyName, currentValue, previousValue)) {
                    return;
                }
                const changes = {};
                changes[propertyName] = {
                    // decouple the row data - if we don't when the grid changes row data directly that'll trigger this component to react to rowData changes,
                    // which can reset grid state (ie row selection)
                    currentValue: propertyName === 'rowData' ? (Object.isFrozen(currentValue) ? currentValue : markRaw(toRaw(currentValue))) : currentValue,
                    previousValue,
                };
                ComponentUtil.processOnChange(changes, this.gridOptions.api);
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
            const rowData = [];
            this.gridOptions.api.forEachNode((rowNode) => {
                rowData.push(rowNode.data);
            });
            return rowData;
        },
        updateModelIfUsed(eventType) {
            if (this.gridReadyFired &&
                this.$attrs[DATA_MODEL_ATTR_NAME] &&
                ROW_DATA_EVENTS.indexOf(eventType) !== -1) {
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
        const gridOptions = markRaw(ComponentUtil.copyAttributesToGridOptions(toRaw(this.gridOptions), this, true));
        this.checkForBindingConflicts();
        const rowData = this.getRowDataBasedOnBindings();
        gridOptions.rowData = rowData ? (Object.isFrozen(rowData) ? rowData : markRaw(toRaw(rowData))) : rowData;
        const gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkOverrides: new VueFrameworkOverrides(this),
            providedBeanInstances: {
                frameworkComponentWrapper,
            },
            modules: this.modules,
        };
        new Grid(this.$el, gridOptions, gridParams);
        this.gridCreated = true;
    },
    unmounted() {
        if (this.gridCreated) {
            if (this.gridOptions.api) {
                this.gridOptions.api.destroy();
            }
            this.isDestroyed = true;
        }
    }
});
