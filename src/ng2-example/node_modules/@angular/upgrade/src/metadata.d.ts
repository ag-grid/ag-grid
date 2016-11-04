import { Type } from '@angular/core';
export interface AttrProp {
    prop: string;
    attr: string;
    bracketAttr: string;
    bracketParenAttr: string;
    parenAttr: string;
    onAttr: string;
    bindAttr: string;
    bindonAttr: string;
}
export interface ComponentInfo {
    type: Type<any>;
    selector: string;
    inputs: AttrProp[];
    outputs: AttrProp[];
}
export declare function getComponentInfo(type: Type<any>): ComponentInfo;
export declare function parseFields(names: string[]): AttrProp[];
