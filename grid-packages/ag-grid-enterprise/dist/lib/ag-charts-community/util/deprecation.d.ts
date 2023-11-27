export declare function createDeprecationWarning(): (key: string, message?: string) => void;
export declare function Deprecated(message?: string, opts?: {
    default?: any;
}): PropertyDecorator;
export declare function DeprecatedAndRenamedTo(newPropName: any, mapValue?: (value: any) => any): PropertyDecorator;
