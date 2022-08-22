export declare function Validate(predicate: (v: any) => boolean): (target: any, key: any) => void;
export declare const BOOLEAN: (v: any) => boolean;
export declare const OPT_BOOLEAN: (v: any) => boolean;
export declare const STRING: (v: any) => boolean;
export declare const OPT_STRING: (v: any) => boolean;
export declare function OPT_NUMBER(min?: number, max?: number): (v: any) => boolean;
export declare function NUMBER(min?: number, max?: number): (v: any) => boolean;
export declare const OPT_FONT_STYLE: (v: any) => boolean;
export declare const OPT_FONT_WEIGHT: (v: any) => boolean;
export declare function Deprecated(message?: string, opts?: {
    default: any;
}): (target: any, key: any) => void;
