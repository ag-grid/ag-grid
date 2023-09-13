import {Component, Prop, Vue} from 'vue-property-decorator';
import {Bean, ComponentUtil, Grid, GridOptions, Module, Events} from '@ag-grid-community/core';
import {VueFrameworkComponentWrapper} from './VueFrameworkComponentWrapper';
import { getAgGridProperties, Properties } from './Utils';
import {VueFrameworkOverrides} from './VueFrameworkOverrides';

const [props, watch, model] = getAgGridProperties();

@Bean('agGridVue')
@Component({
    props,
    watch,
    model,
})
export class AgGridVue extends Vue {

    private static ROW_DATA_EVENTS: Set<string> = new Set(['rowDataChanged', 'rowDataUpdated', 'cellValueChanged', 'rowValueChanged']);
    private static ALWAYS_SYNC_GLOBAL_EVENTS: Set<string> = new Set([Events.EVENT_GRID_PRE_DESTROYED]);

    private static kebabProperty(property: string) {
        return property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    @Prop(Boolean)
    public autoParamsRefresh!: boolean;

    @Prop({default: () => []})
    public componentDependencies!: string[];

    /**
     * Used to register AG Grid Modules directly with this instance of the grid.
     * See [Providing Modules To Individual Grids](https://www.ag-grid.com/vue-data-grid/modules/#providing-modules-to-individual-grids) for more information.
     */
    @Prop({default: () => []})
    public modules!: Module[];

    private gridCreated = false;
    private isDestroyed = false;
    private gridReadyFired = false;

    private gridOptions!: GridOptions;
    private emitRowModel: (() => void) | null = null;

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    public render(h: any) {
        return h('div');
    }

    // It forces events defined in AgGridVue.ALWAYS_SYNC_GLOBAL_EVENTS to be fired synchronously.
    // This is required for events such as GridPreDestroyed.
    // Other events are fired can be fired asynchronously or synchronously depending on config.
    public globalEventListenerFactory (restrictToSyncOnly?: boolean) {
        return (eventType: string, event: any) => {
            if (this.isDestroyed) {
                return;
            }

            if (eventType === 'gridReady') {
                this.gridReadyFired = true;
            }

            const alwaysSync = AgGridVue.ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType);
            if ((alwaysSync && !restrictToSyncOnly) || (!alwaysSync && restrictToSyncOnly)) {
                return;
            }

            this.updateModelIfUsed(eventType);

            // only emit if someone is listening
            // we allow both kebab and camelCase event listeners, so check for both
            const kebabName = AgGridVue.kebabProperty(eventType);
            if (this.$listeners[kebabName]) {
                this.$emit(kebabName, event);
            } else if (this.$listeners[eventType]) {
                this.$emit(eventType, event);
            }
        };
    }

    public processChanges(propertyName: string, currentValue: any, previousValue: any) {
        if (this.gridCreated) {

            if (this.skipChange(propertyName, currentValue, previousValue)) {
                return;
            }

            const changes: Properties = {};
            changes[propertyName] = {
                currentValue,
                previousValue,
            };
            ComponentUtil.processOnChange(changes, this.gridOptions.api!);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    public mounted() {
        // we debounce the model update to prevent a flood of updates in the event there are many individual
        // cell/row updates
        this.emitRowModel = this.debounce(() => {
            this.$emit('data-model-changed', Object.freeze(this.getRowData()));
        }, 20);

        const frameworkComponentWrapper = new VueFrameworkComponentWrapper(this);
        const gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this, true);

        this.checkForBindingConflicts();
        gridOptions.rowData = this.getRowDataBasedOnBindings();

        const gridParams = {
            globalEventListener: this.globalEventListenerFactory().bind(this),
            globalSyncEventListener: this.globalEventListenerFactory(true).bind(this),
            frameworkOverrides: new VueFrameworkOverrides(this),
            providedBeanInstances: {
                frameworkComponentWrapper,
            },
            modules: this.modules,
        };

        new Grid(this.$el as HTMLElement, gridOptions, gridParams);

        this.gridCreated = true;
    }

    // noinspection JSUnusedGlobalSymbols
    public destroyed() {
        if (this.gridCreated) {
            if (this.gridOptions.api) {
                this.gridOptions.api.destroy();
            }
            this.isDestroyed = true;
        }
    }

    private checkForBindingConflicts() {
        const thisAsAny = (this as any);
        if ((thisAsAny.rowData || this.gridOptions.rowData) &&
            thisAsAny.rowDataModel) {
            console.warn('AG Grid: Using both rowData and rowDataModel. rowData will be ignored.');
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
            this.$listeners['data-model-changed'] &&
            AgGridVue.ROW_DATA_EVENTS.has(eventType)) {

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
            this.$listeners['data-model-changed']) {
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
            const later = function() {
                func();
            };
            window.clearTimeout(timeout);
            timeout = window.setTimeout(later, delay);
        };
    }
}
