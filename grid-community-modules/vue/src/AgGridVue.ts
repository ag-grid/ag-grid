import {Component, Prop, Vue} from 'vue-property-decorator';
import {Bean, ComponentUtil, GridOptions, Module, Events, GridApi, createGrid, GridParams} from '@ag-grid-community/core';
import {VueFrameworkComponentWrapper} from './VueFrameworkComponentWrapper';
import { getAgGridProperties, Properties } from './Utils';
import {VueFrameworkOverrides} from './VueFrameworkOverrides';

const [props, computed, watch, model] = getAgGridProperties();

@Bean('agGridVue')
@Component({
    props,
    computed,
    watch,
    model,
})
export class AgGridVue extends Vue {

    private static ROW_DATA_EVENTS: Set<string> = new Set(['rowDataUpdated', 'cellValueChanged', 'rowValueChanged']);
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
    private api: GridApi | undefined = undefined;
    private emitRowModel: (() => void) | null = null;

    // noinspection JSUnusedGlobalSymbols, JSMethodCanBeStatic
    public render(h: any) {
        return h('div');
    }

    // It forces events defined in AgGridVue.ALWAYS_SYNC_GLOBAL_EVENTS to be fired synchronously.
    // This is required for events such as GridPreDestroyed.
    // Other events are fired can be fired asynchronously or synchronously depending on config.
    public globalEventListenerFactory(restrictToSyncOnly?: boolean) {
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

    // noinspection JSUnusedGlobalSymbols
    public mounted() {
        // we debounce the model update to prevent a flood of updates in the event there are many individual
        // cell/row updates
        this.emitRowModel = this.debounce(() => {
            this.$emit('data-model-changed', Object.freeze(this.getRowData()));
        }, 20);

        const frameworkComponentWrapper = new VueFrameworkComponentWrapper(this);
        const gridOptions = ComponentUtil.combineAttributesAndGridOptions(this.gridOptions, this);

        this.checkForBindingConflicts();
        const rowData = this.getRowDataBasedOnBindings();
        if (rowData !== ComponentUtil.VUE_OMITTED_PROPERTY) {
            gridOptions.rowData = rowData;
        }

        const gridParams: GridParams = {
            globalEventListener: this.globalEventListenerFactory().bind(this),
            globalSyncEventListener: this.globalEventListenerFactory(true).bind(this),
            frameworkOverrides: new VueFrameworkOverrides(this),
            providedBeanInstances: {
                frameworkComponentWrapper,
            },
            modules: this.modules,
        };

        this.api = createGrid(this.$el as HTMLElement, gridOptions, gridParams);
        this.gridCreated = true;
    }

    // noinspection JSUnusedGlobalSymbols
    public destroyed() {
        if (this.gridCreated) {
            this.api?.destroy();
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
        this.api?.forEachNode((rowNode) => {
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
