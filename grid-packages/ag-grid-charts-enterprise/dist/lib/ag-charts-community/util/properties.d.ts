export declare class BaseProperties<T extends object = object> {
    protected className?: string | undefined;
    constructor(className?: string | undefined);
    set(properties: T): this;
    isValid<TContext = Omit<T, 'type'>>(this: TContext): boolean;
    toJson<T>(this: T): Record<string, any>;
}
export declare class PropertiesArray<T extends BaseProperties> extends Array {
    private itemFactory;
    constructor(itemFactory: new () => T, ...properties: object[]);
    set(properties: object[]): PropertiesArray<T>;
    reset(properties: object[]): PropertiesArray<T>;
    toJson(): any[];
}
export declare function isProperties<T extends object>(value: unknown): value is BaseProperties<T>;
