export declare function ProxyProperty(proxyPath: string | string[]): PropertyDecorator;
export declare function ProxyOnWrite(proxyProperty: string): PropertyDecorator;
export declare function ProxyPropertyOnWrite(childName: string, childProperty?: string): PropertyDecorator;
export interface ActionOnSetOptions<T, V = any> {
    newValue?: (this: T, newValue: V) => void;
    oldValue?: (this: T, oldValue: V) => void;
    changeValue?: (this: T, newValue?: V, oldValue?: V | undefined) => void;
}
/**
 * Allows side-effects to be triggered on property write.
 *
 * @param opts.newValue called when a new value is set - never called for undefined values.
 * @param opts.oldValue called with the old value before a new value is set - never called for
 *                      undefined values.
 * @param opts.changeValue called on any change to the value - always called.
 */
export declare function ActionOnSet<T, V = any>(opts: ActionOnSetOptions<T, V>): PropertyDecorator;
export declare function ObserveChanges<T, V = any>(observerFn: (target: T, newValue?: V, oldValue?: V) => void): PropertyDecorator;
