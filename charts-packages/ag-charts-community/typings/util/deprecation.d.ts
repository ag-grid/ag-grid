export declare function createDeprecationWarning(): (key: string, message?: string | undefined) => void;
export declare function Deprecated(message?: string, opts?: {
    default?: any;
}): (target: any, key: any) => void;
export declare function DeprecatedAndRenamedTo(newPropName: any): (target: any, key: any) => void;
