import { Vue } from 'vue-property-decorator';
import { Module } from '@ag-grid-community/core';
export declare class AgGridVue extends Vue {
    private static ROW_DATA_EVENTS;
    private static kebabProperty;
    autoParamsRefresh: boolean;
    componentDependencies: string[];
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
