import {defineComponent, PropType, h} from 'vue';
import {markRaw, toRaw} from '@vue/reactivity';
import {ComponentUtil, Grid, GridOptions, Module, RowNode} from 'ag-grid-community';

import {VueFrameworkComponentWrapper} from './VueFrameworkComponentWrapper';
import {getAgGridProperties, kebabNameToAttrEventName, kebabProperty, Properties} from './Utils';
import {AgGridColumn} from './AgGridColumn';
import {VueFrameworkOverrides} from './VueFrameworkOverrides';

const ROW_DATA_EVENTS = ['rowDataChanged', 'rowDataUpdated', 'cellValueChanged', 'rowValueChanged'];
const DATA_MODEL_ATTR_NAME = kebabNameToAttrEventName(kebabProperty('data-model-changed'));

const [props, watch, model] = getAgGridProperties();

export const AgGridVue = defineComponent({
    render() {
        return h('div')
    },
    props: {
        gridOptions: {
            type: Object as PropType<GridOptions>,
            default: () => ({} as GridOptions),
        },
        autoParamsRefresh: {
            type: Boolean,
            default: () => false,
        },
        componentDependencies: {
            type: Array as PropType<String[]>,
            default: () => [],
        },
        plugins: [],
        modules: {
            type: Array as PropType<Module[]>,
            default: () => [],
        },
        rowDataModel: undefined as any,
        ...props
    },
    data() {
        return {
            gridCreated: false,
            isDestroyed: false,
            gridReadyFired: false,
            emitRowModel: undefined as (() => void | null) | undefined
        }
    },
    watch: {
        rowDataModel: {
            handler(currentValue: any, previousValue: any) {
                this.processChanges('rowData', currentValue, previousValue);
            },
            deep: true
        },
        ...watch
    },
    model,
    methods: {
        globalEventListener(eventType: string, event: any) {
            if (this.isDestroyed) {
                return;
            }

            if (eventType === 'gridReady') {
                this.gridReadyFired = true;
            }

            this.updateModelIfUsed(eventType);
        },
        processChanges(propertyName: string, currentValue: any, previousValue: any) {
            if (this.gridCreated) {
                if (this.skipChange(propertyName, currentValue, previousValue)) {
                    return;
                }

                const changes: Properties = {};
                changes[propertyName] = {
                    // decouple the row data - if we don't when the grid changes row data directly that'll trigger this component to react to rowData changes,
                    // which can reset grid state (ie row selection)
                    currentValue: propertyName === 'rowData' ? (Object.isFrozen(currentValue) ? currentValue : markRaw(toRaw(currentValue))) : currentValue,
                    previousValue,
                };
                ComponentUtil.processOnChange(changes,
                    this.gridOptions,
                    this.gridOptions.api!,
                    this.gridOptions.columnApi!);
            }
        },
        checkForBindingConflicts() {
            const thisAsAny = (this as any);
            if ((thisAsAny.rowData || this.gridOptions.rowData) &&
                thisAsAny.rowDataModel) {
                console.warn('ag-grid: Using both rowData and rowDataModel. rowData will be ignored.');
            }
        },
        getRowData(): any[] {
            const rowData: any[] = [];
            this.gridOptions.api!.forEachNode((rowNode: RowNode) => {
                rowData.push(rowNode.data);
            });
            return rowData;
        },
        updateModelIfUsed(eventType: string) {
            if (this.gridReadyFired &&
                this.$attrs[DATA_MODEL_ATTR_NAME] &&
                ROW_DATA_EVENTS.indexOf(eventType) !== -1) {

                if (this.emitRowModel) {
                    this.emitRowModel();
                }
            }
        },
        getRowDataBasedOnBindings() {
            const thisAsAny = (this as any);

            const rowDataModel = thisAsAny.rowDataModel;
            return rowDataModel ? rowDataModel :
                thisAsAny.rowData ? thisAsAny.rowData : thisAsAny.gridOptions.rowData;
        },
        /*
        * Prevents an infinite loop when using v-model for the rowData
        */
        skipChange(propertyName: string, currentValue: any, previousValue: any) {
            if (this.gridReadyFired &&
                propertyName === 'rowData' &&
                this.$attrs[DATA_MODEL_ATTR_NAME]) {
                if (currentValue === previousValue) {
                    return true;
                }

                if (currentValue && previousValue) {
                    const currentRowData = currentValue as any[];
                    const previousRowData = previousValue as any[];
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
        debounce(func: () => void, delay: number) {
            let timeout: number;
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
            this.$emit(DATA_MODEL_ATTR_NAME, Object.freeze(this.getRowData()));
        }, 20);

        const frameworkComponentWrapper = new VueFrameworkComponentWrapper(this);

        // the gridOptions we pass to the grid don't need to be reactive (and shouldn't be - it'll cause issues
        // with mergeDeep for example
        const gridOptions = markRaw(ComponentUtil.copyAttributesToGridOptions(toRaw(this.gridOptions), this));

        this.checkForBindingConflicts();

        const rowData = this.getRowDataBasedOnBindings();
        gridOptions.rowData = rowData ? (Object.isFrozen(rowData) ? rowData : markRaw(toRaw(rowData))) : rowData;

        if (AgGridColumn.hasChildColumns(this.$slots)) {
            gridOptions.columnDefs = AgGridColumn.mapChildColumnDefs(this.$slots);
        }

        const gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkOverrides: new VueFrameworkOverrides(this),
            providedBeanInstances: {
                frameworkComponentWrapper,
            },
            modules: this.modules,
        };

        new Grid(this.$el as HTMLElement, gridOptions, gridParams);

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
