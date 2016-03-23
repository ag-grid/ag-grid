// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { GridOptions } from "../entities/gridOptions";
import { GridApi } from "../gridApi";
export declare class ComponentUtil {
    static EVENTS: string[];
    private static EVENT_CALLBACKS;
    static STRING_PROPERTIES: string[];
    static OBJECT_PROPERTIES: string[];
    static ARRAY_PROPERTIES: string[];
    static NUMBER_PROPERTIES: string[];
    static BOOLEAN_PROPERTIES: string[];
    static FUNCTION_PROPERTIES: string[];
    static ALL_PROPERTIES: string[];
    static getEventCallbacks(): string[];
    static copyAttributesToGridOptions(gridOptions: GridOptions, component: any): GridOptions;
    static getCallbackForEvent(eventName: string): string;
    static processOnChange(changes: any, gridOptions: GridOptions, api: GridApi): void;
    static toBoolean(value: any): boolean;
    static toNumber(value: any): number;
}
