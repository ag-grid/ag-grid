import { PropType } from 'vue';
import { GridApi, GridOptions, Module } from 'ag-grid-community';
import { Properties } from './Utils';
export declare const AgGridVue: import("vue").DefineComponent<{
    gridOptions: {
        type: PropType<GridOptions<any>>;
        default: () => GridOptions<any>;
    };
    autoParamsRefresh: {
        type: BooleanConstructor;
        default: () => boolean;
    };
    componentDependencies: {
        type: PropType<String[]>;
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
}, Properties, {
    globalEventListenerFactory(restrictToSyncOnly?: boolean): (eventType: string, event: any) => void;
    processChanges(propertyName: string, currentValue: any, previousValue: any): void;
    checkForBindingConflicts(): void;
    getRowData(): any[];
    updateModelIfUsed(eventType: string): void;
    getRowDataBasedOnBindings(): any;
    getProvides(): {};
    skipChange(propertyName: string, currentValue: any, previousValue: any): boolean;
    debounce(func: () => void, delay: number): () => void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    gridOptions: {
        type: PropType<GridOptions<any>>;
        default: () => GridOptions<any>;
    };
    autoParamsRefresh: {
        type: BooleanConstructor;
        default: () => boolean;
    };
    componentDependencies: {
        type: PropType<String[]>;
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
    autoParamsRefresh: boolean;
    componentDependencies: String[];
    modules: Module[];
}, {}>;
