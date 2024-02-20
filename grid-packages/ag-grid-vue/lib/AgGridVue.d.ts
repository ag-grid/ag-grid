import { Vue } from 'vue-property-decorator';
import { Module } from 'ag-grid-community';
export declare class AgGridVue extends Vue {
    private static ROW_DATA_EVENTS;
    private static ALWAYS_SYNC_GLOBAL_EVENTS;
    private static kebabProperty;
    autoParamsRefresh: boolean;
    componentDependencies: string[];
    /**
     * Used to register AG Grid Modules directly with this instance of the grid.
     * See [Providing Modules To Individual Grids](https://www.ag-grid.com/vue-data-grid/modules/#providing-modules-to-individual-grids) for more information.
     */
    modules: Module[];
    private gridCreated;
    private isDestroyed;
    private gridReadyFired;
    private gridOptions;
    private api;
    private emitRowModel;
    render(h: any): any;
    globalEventListenerFactory(restrictToSyncOnly?: boolean): (eventType: string, event: any) => void;
    mounted(): void;
    destroyed(): void;
    private checkForBindingConflicts;
    private getRowData;
    private updateModelIfUsed;
    private getRowDataBasedOnBindings;
    private debounce;
}
