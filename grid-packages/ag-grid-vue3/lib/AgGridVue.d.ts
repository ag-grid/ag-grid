import { PropType } from 'vue';
import { GridOptions, Module } from 'ag-grid-community';
export declare const AgGridVue: import("vue").DefineComponent<{
    gridOptions: {
        type: PropType<GridOptions>;
        default: () => GridOptions;
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
    gridCreated: boolean;
    isDestroyed: boolean;
    gridReadyFired: boolean;
    emitRowModel: (() => void | null) | undefined;
}, {}, {
    globalEventListener(eventType: string, event: any): void;
    processChanges(propertyName: string, currentValue: any, previousValue: any): void;
    checkForBindingConflicts(): void;
    getRowData(): any[];
    updateModelIfUsed(eventType: string): void;
    getRowDataBasedOnBindings(): any;
    skipChange(propertyName: string, currentValue: any, previousValue: any): boolean;
    debounce(func: () => void, delay: number): () => void;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    gridOptions: {
        type: PropType<GridOptions>;
        default: () => GridOptions;
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
    gridOptions: GridOptions;
    autoParamsRefresh: boolean;
    componentDependencies: String[];
    modules: Module[];
    modelValue: unknown[];
}>;
