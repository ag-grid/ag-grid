import {h} from 'vue'
import {Options, Vue} from 'vue-class-component';
import {Bean, ComponentUtil, Grid, GridOptions, Module} from '@ag-grid-community/core';
import {VueFrameworkComponentWrapper} from './VueFrameworkComponentWrapper';
import {getAgGridProperties, kebabNameToAttrEventName, kebabProperty, Properties} from './Utils';
import {AgGridColumn} from './AgGridColumn';
import {markRaw, toRaw} from '@vue/reactivity';
import {VueFrameworkOverrides} from './VueFrameworkOverrides';

const [props, watch, model] = getAgGridProperties();

@Bean('agGridVue')
@Options({
    props,
    watch,
    model,
    // emits: ['onGrid-ready' / 'grid-ready' / 'gridReady' doesn't work :-) ]
})
export class AgGridVue extends Vue {

    public static VERSION = 'Vue 3+';

    private static ROW_DATA_EVENTS = ['rowDataChanged', 'rowDataUpdated', 'cellValueChanged', 'rowValueChanged'];

    private static DATA_MODEL_ATTR_NAME = kebabNameToAttrEventName(kebabProperty('data-model-changed'));

    public autoParamsRefresh!: boolean;
    public componentDependencies!: string[];
    public modules!: Module[];

    private gridCreated = false;
    private isDestroyed = false;
    private gridReadyFired = false;

    private gridOptions!: GridOptions;
    private emitRowModel: (() => void) | null = null;

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    public render() {
        return h('div');
    }

    public globalEventListener(eventType: string, event: any) {
        if (this.isDestroyed) {
            return;
        }

        if (eventType === 'gridReady') {
            this.gridReadyFired = true;
        }

        this.updateModelIfUsed(eventType);
    }

    public processChanges(propertyName: string, currentValue: any, previousValue: any) {
        if (this.gridCreated) {

            if (this.skipChange(propertyName, currentValue, previousValue)) {
                return;
            }

            const changes: Properties = {};
            changes[propertyName] = {
                // decouple the rowdata - if we don't when the grid changes rowdata directly that'll trigger this component to react to rowData changes,
                // which can reset grid state (ie row selection)
                currentValue: propertyName === 'rowData' ? (Object.isFrozen(currentValue) ? currentValue : markRaw(toRaw(currentValue))) : currentValue,
                previousValue,
            };
            ComponentUtil.processOnChange(changes,
                this.gridOptions,
                this.gridOptions.api!,
                this.gridOptions.columnApi!);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    public mounted() {
        // we debounce the model update to prevent a flood of updates in the event there are many individual
        // cell/row updates
        this.emitRowModel = this.debounce(() => {
            this.$emit(AgGridVue.DATA_MODEL_ATTR_NAME, Object.freeze(this.getRowData()));
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
    }

    public destroyed() {
        if (this.gridCreated) {
            if (this.gridOptions.api) {
                this.gridOptions.api.destroy();
            }
            this.isDestroyed = true;
        }
    }

    public unmounted() {
        this.destroyed();
    }

    private checkForBindingConflicts() {
        const thisAsAny = (this as any);
        if ((thisAsAny.rowData || this.gridOptions.rowData) &&
            thisAsAny.rowDataModel) {
            console.warn('ag-grid: Using both rowData and rowDataModel. rowData will be ignored.');
        }
    }

    private getRowData(): any[] {
        const rowData: any[] = [];
        this.gridOptions.api!.forEachNode((rowNode) => {
            rowData.push(rowNode.data);
        });
        return rowData;
    }

    private updateModelIfUsed(eventType: string) {
        if (this.gridReadyFired &&
            this.$attrs[AgGridVue.DATA_MODEL_ATTR_NAME] &&
            AgGridVue.ROW_DATA_EVENTS.indexOf(eventType) !== -1) {

            if (this.emitRowModel) {
                this.emitRowModel();
            }
        }
    }

    private getRowDataBasedOnBindings() {
        const thisAsAny = (this as any);

        const rowDataModel = thisAsAny.rowDataModel;
        return rowDataModel ? rowDataModel :
            thisAsAny.rowData ? thisAsAny.rowData : thisAsAny.gridOptions.rowData;
    }

    /*
     * Prevents an infinite loop when using v-model for the rowData
     */
    private skipChange(propertyName: string, currentValue: any, previousValue: any) {
        if (this.gridReadyFired &&
            propertyName === 'rowData' &&
            this.$attrs[AgGridVue.DATA_MODEL_ATTR_NAME]) {
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
    }

    private debounce(func: () => void, delay: number) {
        let timeout: number;
        return () => {
            const later = function () {
                func();
            };
            window.clearTimeout(timeout);
            timeout = window.setTimeout(later, delay);
        };
    }
}
