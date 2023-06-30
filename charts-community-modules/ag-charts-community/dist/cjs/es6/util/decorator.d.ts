export declare const BREAK_TRANSFORM_CHAIN: unique symbol;
declare type TransformFn = (target: any, key: string | symbol, value: any, oldValue?: any) => any | typeof BREAK_TRANSFORM_CHAIN;
export declare function addTransformToInstanceProperty(setTransform: TransformFn, getTransform?: TransformFn): PropertyDecorator;
export {};
//# sourceMappingURL=decorator.d.ts.map