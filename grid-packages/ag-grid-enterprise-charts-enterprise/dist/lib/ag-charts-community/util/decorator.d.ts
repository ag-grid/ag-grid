export declare const BREAK_TRANSFORM_CHAIN: unique symbol;
type TransformFn = (target: any, key: string | symbol, value: any, oldValue?: any) => any | typeof BREAK_TRANSFORM_CHAIN;
type ObserveFn = (target: any, value: any, oldValue?: any) => void;
interface TransformConfig {
    setters: TransformFn[];
    getters: TransformFn[];
    observers: ObserveFn[];
    valuesMap: WeakMap<object, Map<string, unknown>>;
    optional?: boolean;
}
type ConfigMetadata = Omit<TransformConfig, 'setters' | 'getters' | 'observers' | 'valuesMap'>;
type DecoratedObject = {
    __decorator_config: Record<string, TransformConfig>;
};
export declare function addTransformToInstanceProperty(setTransform: TransformFn, getTransform?: TransformFn, configMetadata?: ConfigMetadata): PropertyDecorator;
export declare function addObserverToInstanceProperty(setObserver: TransformFn): PropertyDecorator;
export declare function isDecoratedObject(target: any): target is DecoratedObject;
export declare function listDecoratedProperties(target: any): string[];
export declare function extractDecoratedProperties(target: any): Record<string, any>;
export declare function extractDecoratedPropertyMetadata(target: any, propertyKeyOrSymbol: string | symbol): TransformConfig | undefined;
export {};
