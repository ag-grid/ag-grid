// Type definitions for @ag-grid-community/core v29.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColDef, ColGroupDef } from "../entities/colDef";
declare type ColKey = keyof (ColDef) | (keyof ColGroupDef);
export declare class ColDefUtil {
    private static ColDefPropertyMap;
    static ALL_PROPERTIES: ColKey[];
    static FRAMEWORK_PROPERTIES: string[];
}
export {};
