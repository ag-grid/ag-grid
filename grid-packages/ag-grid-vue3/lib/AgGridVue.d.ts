import { Vue } from 'vue-class-component';
import { Module } from 'ag-grid-community';
export declare class AgGridVue extends Vue {
    static VERSION: string;
    private static ROW_DATA_EVENTS;
    private static DATA_MODEL_ATTR_NAME;
    autoParamsRefresh: boolean;
    componentDependencies: string[];
    modules: Module[];
    private gridCreated;
    private isDestroyed;
    private gridReadyFired;
    private gridOptions;
    private emitRowModel;
    render(): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    globalEventListener(eventType: string, event: any): void;
    processChanges(propertyName: string, currentValue: any, previousValue: any): void;
    mounted(): void;
    destroyed(): void;
    unmounted(): void;
    private checkForBindingConflicts;
    private getRowData;
    private updateModelIfUsed;
    private getRowDataBasedOnBindings;
    private skipChange;
    private debounce;
}
