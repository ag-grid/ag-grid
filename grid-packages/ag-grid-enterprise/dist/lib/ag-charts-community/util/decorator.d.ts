export declare const BREAK_TRANSFORM_CHAIN: unique symbol;
type TransformFn = (target: any, key: string | symbol, value: any, oldValue?: any) => any | typeof BREAK_TRANSFORM_CHAIN;
interface TransformConfig {
    setters: TransformFn[];
    getters: TransformFn[];
    valuesMap: WeakMap<object, Map<string, unknown>>;
    optional?: boolean;
}
type DecoratedObject = {
    __decorator_config: Record<string, TransformConfig>;
};
export declare function addTransformToInstanceProperty(setTransform: TransformFn, getTransform?: TransformFn, configMetadata?: Omit<TransformConfig, 'setters' | 'getters' | 'valuesMap'>): PropertyDecorator;
export declare function isDecoratedObject(target: any): target is DecoratedObject;
export declare function listDecoratedProperties(target: any): string[];
export declare function extractDecoratedProperties(target: any): Record<string, any>;
export declare function extractDecoratedPropertyMetadata(target: any, propertyKeyOrSymbol: string | symbol): TransformConfig | undefined;
export {};
