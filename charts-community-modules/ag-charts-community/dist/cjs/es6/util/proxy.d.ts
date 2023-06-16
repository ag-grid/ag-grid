export declare function ProxyOnWrite(proxyProperty: string): PropertyDecorator;
export declare function ProxyPropertyOnWrite(childName: string, childProperty?: string): PropertyDecorator;
/**
 * Allows side-effects to be triggered on property write.
 *
 * @param opts.newValue called when a new value is set - never called for undefined values.
 * @param opts.oldValue called with the old value before a new value is set - never called for
 *                      undefined values.
 * @param opts.changeValue called on any change to the value - always called.
 */
export declare function ActionOnSet<T>(opts: {
    newValue?: (this: T, newValue: any) => void;
    oldValue?: (this: T, oldValue: any) => void;
    changeValue?: (this: T, newValue?: any, oldValue?: any) => void;
}): PropertyDecorator;
//# sourceMappingURL=proxy.d.ts.map