import { ColDef, ColGroupDef } from "../entities/colDef";
declare type ColKey = keyof (ColDef) | (keyof ColGroupDef);
export declare class ColDefUtil {
    private static ColDefPropertyMap;
    static ALL_PROPERTIES: ColKey[];
    static FRAMEWORK_PROPERTIES: string[];
}
export {};
