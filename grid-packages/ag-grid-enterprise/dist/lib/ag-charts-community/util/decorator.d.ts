export declare const BREAK_TRANSFORM_CHAIN: unique symbol;
type TransformFn = (target: any, key: string | symbol, value: any, oldValue?: any) => any | typeof BREAK_TRANSFORM_CHAIN;
type DecoratedObject = {
    __decorator_config: object;
};
export declare function addTransformToInstanceProperty(setTransform: TransformFn, getTransform?: TransformFn): PropertyDecorator;
export declare function isDecoratedObject(target: any): target is DecoratedObject;
export declare function listDecoratedProperties(target: any): string[];
export declare function extractDecoratedProperties(target: any): Record<string, any>;
export {};
