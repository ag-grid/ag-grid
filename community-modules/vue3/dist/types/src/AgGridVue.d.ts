import type { AgEventType, GridApi, GridOptions, Module } from '@ag-grid-community/core';
import type { PropType } from 'vue';
import type { Properties } from './Utils';
export declare const AgGridVue: import("vue").DefineComponent<{
    gridOptions: {
        type: PropType<GridOptions<any>>;
        default: () => GridOptions<any>;
    };
    componentDependencies: {
        type: PropType<string[]>;
        default: () => never[];
    };
    plugins: never[];
    modules: {
        type: PropType<Module[]>;
        default: () => never[];
    };
    modelValue: {
        type: ArrayConstructor;
        default: undefined;
        required: false;
    };
}, unknown, {
    api: GridApi | undefined;
    gridCreated: boolean;
    isDestroyed: boolean;
    gridReadyFired: boolean;
    emitRowModel?: (() => void | null) | undefined;
    batchTimeout: number | null;
    batchChanges: {
        [key: string]: any;
    };
}, Properties, {
    globalEventListenerFactory(restrictToSyncOnly?: boolean): (eventType: AgEventType) => void;
    processChanges(propertyName: string, currentValue: any, previousValue: any): void;
    checkForBindingConflicts(): void;
    getRowData(): any[];
    updateModelIfUsed(eventType: string): void;
    getRowDataBasedOnBindings(): any;
    getProvides(): {};
    skipChange(propertyName: string, currentValue: any, previousValue: any): boolean;
    debounce(func: () => void, delay: number): () => void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    gridOptions: {
        type: PropType<GridOptions<any>>;
        default: () => GridOptions<any>;
    };
    componentDependencies: {
        type: PropType<string[]>;
        default: () => never[];
    };
    plugins: never[];
    modules: {
        type: PropType<Module[]>;
        default: () => never[];
    };
    modelValue: {
        type: ArrayConstructor;
        default: undefined;
        required: false;
    };
}>>, {
    modelValue: unknown[];
    gridOptions: GridOptions<any>;
    componentDependencies: string[];
    modules: Module[];
}, {}>;
