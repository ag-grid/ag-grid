import { GridOptions } from '../entities/gridOptions';
import { GridApi } from '../gridApi';
import { ColumnApi } from '../columns/columnApi';
export declare class ComponentUtil {
    static EVENTS: string[];
    static PUBLIC_EVENTS: string[];
    static EXCLUDED_INTERNAL_EVENTS: string[];
    private static EVENT_CALLBACKS;
    static STRING_PROPERTIES: string[];
    static OBJECT_PROPERTIES: string[];
    static ARRAY_PROPERTIES: string[];
    static NUMBER_PROPERTIES: string[];
    static BOOLEAN_PROPERTIES: string[];
    static FUNCTION_PROPERTIES: string[];
    static ALL_PROPERTIES: string[];
    static getEventCallbacks(): string[];
    static copyAttributesToGridOptions(gridOptions: GridOptions, component: any, skipEventDeprecationCheck?: boolean): GridOptions;
    static getCallbackForEvent(eventName: string): string;
    static processOnChange(changes: any, gridOptions: GridOptions, api: GridApi, columnApi: ColumnApi): void;
    static toBoolean(value: any): boolean;
    static toNumber(value: any): number | undefined;
}
