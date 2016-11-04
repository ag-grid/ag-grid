import { SimpleChange } from '../change_detection/change_detection';
import { ViewEncapsulation } from '../metadata/view';
import { RenderComponentType, RenderDebugInfo, Renderer, RootRenderer } from '../render/api';
import { Sanitizer } from '../security';
export declare class ViewUtils {
    private _renderer;
    private _appId;
    sanitizer: Sanitizer;
    private _nextCompTypeId;
    constructor(_renderer: RootRenderer, _appId: string, sanitizer: Sanitizer);
    /**
     * Used by the generated code
     */
    createRenderComponentType(templateUrl: string, slotCount: number, encapsulation: ViewEncapsulation, styles: Array<string | any[]>, animations: {
        [key: string]: Function;
    }): RenderComponentType;
}
export declare function flattenNestedViewRenderNodes(nodes: any[]): any[];
export declare function ensureSlotCount(projectableNodes: any[][], expectedSlotCount: number): any[][];
export declare const MAX_INTERPOLATION_VALUES: number;
export declare function interpolate(valueCount: number, c0: string, a1: any, c1: string, a2?: any, c2?: string, a3?: any, c3?: string, a4?: any, c4?: string, a5?: any, c5?: string, a6?: any, c6?: string, a7?: any, c7?: string, a8?: any, c8?: string, a9?: any, c9?: string): string;
export declare function checkBinding(throwOnChange: boolean, oldValue: any, newValue: any): boolean;
export declare function castByValue<T>(input: any, value: T): T;
export declare const EMPTY_ARRAY: any[];
export declare const EMPTY_MAP: {};
export declare function pureProxy1<P0, R>(fn: (p0: P0) => R): (p0: P0) => R;
export declare function pureProxy2<P0, P1, R>(fn: (p0: P0, p1: P1) => R): (p0: P0, p1: P1) => R;
export declare function pureProxy3<P0, P1, P2, R>(fn: (p0: P0, p1: P1, p2: P2) => R): (p0: P0, p1: P1, p2: P2) => R;
export declare function pureProxy4<P0, P1, P2, P3, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3) => R): (p0: P0, p1: P1, p2: P2, p3: P3) => R;
export declare function pureProxy5<P0, P1, P2, P3, P4, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4) => R): (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4) => R;
export declare function pureProxy6<P0, P1, P2, P3, P4, P5, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) => R): (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) => R;
export declare function pureProxy7<P0, P1, P2, P3, P4, P5, P6, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R): (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6) => R;
export declare function pureProxy8<P0, P1, P2, P3, P4, P5, P6, P7, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7) => R): (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7) => R;
export declare function pureProxy9<P0, P1, P2, P3, P4, P5, P6, P7, P8, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8) => R): (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8) => R;
export declare function pureProxy10<P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, R>(fn: (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8, p9: P9) => R): (p0: P0, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p8: P8, p9: P9) => R;
export declare function setBindingDebugInfoForChanges(renderer: Renderer, el: any, changes: {
    [key: string]: SimpleChange;
}): void;
export declare function setBindingDebugInfo(renderer: Renderer, el: any, propName: string, value: any): void;
export declare function createRenderElement(renderer: Renderer, parentElement: any, name: string, attrs: InlineArray<string>, debugInfo?: RenderDebugInfo): any;
export declare function selectOrCreateRenderHostElement(renderer: Renderer, elementName: string, attrs: InlineArray<string>, rootSelectorOrNode: string | any, debugInfo?: RenderDebugInfo): any;
export interface InlineArray<T> {
    length: number;
    get(index: number): T;
}
export declare class InlineArray2<T> implements InlineArray<T> {
    length: number;
    private _v0;
    private _v1;
    constructor(length: number, _v0?: T, _v1?: T);
    get(index: number): T;
}
export declare class InlineArray4<T> implements InlineArray<T> {
    length: number;
    private _v0;
    private _v1;
    private _v2;
    private _v3;
    constructor(length: number, _v0?: T, _v1?: T, _v2?: T, _v3?: T);
    get(index: number): T;
}
export declare class InlineArray8<T> implements InlineArray<T> {
    length: number;
    private _v0;
    private _v1;
    private _v2;
    private _v3;
    private _v4;
    private _v5;
    private _v6;
    private _v7;
    constructor(length: number, _v0?: T, _v1?: T, _v2?: T, _v3?: T, _v4?: T, _v5?: T, _v6?: T, _v7?: T);
    get(index: number): T;
}
export declare class InlineArray16<T> implements InlineArray<T> {
    length: number;
    private _v0;
    private _v1;
    private _v2;
    private _v3;
    private _v4;
    private _v5;
    private _v6;
    private _v7;
    private _v8;
    private _v9;
    private _v10;
    private _v11;
    private _v12;
    private _v13;
    private _v14;
    private _v15;
    constructor(length: number, _v0?: T, _v1?: T, _v2?: T, _v3?: T, _v4?: T, _v5?: T, _v6?: T, _v7?: T, _v8?: T, _v9?: T, _v10?: T, _v11?: T, _v12?: T, _v13?: T, _v14?: T, _v15?: T);
    get(index: number): T;
}
export declare class InlineArrayDynamic<T> implements InlineArray<T> {
    length: number;
    private _values;
    constructor(length: number, ...values: any[]);
    get(index: number): any;
}
export declare const EMPTY_INLINE_ARRAY: InlineArray<any>;
