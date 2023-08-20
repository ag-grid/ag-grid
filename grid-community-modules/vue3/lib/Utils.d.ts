export declare const kebabProperty: (property: string) => string;
export declare const kebabNameToAttrEventName: (kebabName: string) => string;
export interface Properties {
    [propertyName: string]: any;
}
export declare const getAgGridProperties: () => [Properties, Properties];
