import type { ModuleContext } from '../module/moduleContext';
import type { JsonApplyParams } from '../util/json';
export declare const JSON_APPLY_PLUGINS: JsonApplyParams;
export declare function assignJsonApplyConstructedArray(array: any[], ctor: new () => any): void;
export declare function getJsonApplyOptions(ctx: ModuleContext): JsonApplyParams;
