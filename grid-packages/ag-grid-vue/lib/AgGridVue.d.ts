import { Vue } from 'vue-property-decorator';
import { Module } from 'ag-grid-community';
export declare class AgGridVue extends Vue {
    private static ROW_DATA_EVENTS;
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
    private emitRowModel;
    render(h: any): any;
    globalEventListener(eventType: string, event: any): void;
    processChanges(propertyName: string, currentValue: any, previousValue: any): void;
    mounted(): void;
    destroyed(): void;
    private checkForBindingConflicts;
    private getRowData;
    private updateModelIfUsed;
    private getRowDataBasedOnBindings;
    private skipChange;
    private debounce;
}
