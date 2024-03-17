import { ColDef, ColGroupDef } from "../entities/colDef";
type ColKey = keyof (ColDef) | (keyof ColGroupDef);
export declare class ColDefUtil {
    private static ColDefPropertyMap;
    static ALL_PROPERTIES: ColKey[];
}
export {};
