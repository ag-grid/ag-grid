export declare const kebabProperty: (property: string) => string;
export declare const kebabNameToAttrEventName: (kebabName: string) => string;
export declare const convertToRaw: (value: any) => any;
export interface Properties {
    [propertyName: string]: any;
}
export declare const getAgGridProperties: () => [Properties, Properties, Properties];
