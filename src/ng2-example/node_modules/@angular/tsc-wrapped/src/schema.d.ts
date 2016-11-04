export declare const VERSION: number;
export declare type MetadataEntry = ClassMetadata | FunctionMetadata | MetadataValue;
export interface ModuleMetadata {
    __symbolic: 'module';
    version: number;
    exports?: ModuleExportMetadata[];
    metadata: {
        [name: string]: MetadataEntry;
    };
}
export declare function isModuleMetadata(value: any): value is ModuleMetadata;
export interface ModuleExportMetadata {
    export?: (string | {
        name: string;
        as: string;
    })[];
    from: string;
}
export interface ClassMetadata {
    __symbolic: 'class';
    decorators?: (MetadataSymbolicExpression | MetadataError)[];
    members?: MetadataMap;
    statics?: {
        [name: string]: MetadataValue | FunctionMetadata;
    };
}
export declare function isClassMetadata(value: any): value is ClassMetadata;
export interface MetadataMap {
    [name: string]: MemberMetadata[];
}
export interface MemberMetadata {
    __symbolic: 'constructor' | 'method' | 'property';
    decorators?: (MetadataSymbolicExpression | MetadataError)[];
}
export declare function isMemberMetadata(value: any): value is MemberMetadata;
export interface MethodMetadata extends MemberMetadata {
    __symbolic: 'constructor' | 'method';
    parameterDecorators?: (MetadataSymbolicExpression | MetadataError)[][];
}
export declare function isMethodMetadata(value: any): value is MethodMetadata;
export interface ConstructorMetadata extends MethodMetadata {
    __symbolic: 'constructor';
    parameters?: (MetadataSymbolicExpression | MetadataError | null)[];
}
export declare function isConstructorMetadata(value: any): value is ConstructorMetadata;
export interface FunctionMetadata {
    __symbolic: 'function';
    parameters: string[];
    defaults?: MetadataValue[];
    value: MetadataValue;
}
export declare function isFunctionMetadata(value: any): value is FunctionMetadata;
export declare type MetadataValue = string | number | boolean | MetadataObject | MetadataArray | MetadataSymbolicExpression | MetadataError;
export interface MetadataObject {
    [name: string]: MetadataValue;
}
export interface MetadataArray {
    [name: number]: MetadataValue;
}
export interface MetadataSymbolicExpression {
    __symbolic: 'binary' | 'call' | 'index' | 'new' | 'pre' | 'reference' | 'select' | 'spread' | 'if';
}
export declare function isMetadataSymbolicExpression(value: any): value is MetadataSymbolicExpression;
export interface MetadataSymbolicBinaryExpression extends MetadataSymbolicExpression {
    __symbolic: 'binary';
    operator: '&&' | '||' | '|' | '^' | '&' | '==' | '!=' | '===' | '!==' | '<' | '>' | '<=' | '>=' | 'instanceof' | 'in' | 'as' | '<<' | '>>' | '>>>' | '+' | '-' | '*' | '/' | '%' | '**';
    left: MetadataValue;
    right: MetadataValue;
}
export declare function isMetadataSymbolicBinaryExpression(value: any): value is MetadataSymbolicBinaryExpression;
export interface MetadataSymbolicIndexExpression extends MetadataSymbolicExpression {
    __symbolic: 'index';
    expression: MetadataValue;
    index: MetadataValue;
}
export declare function isMetadataSymbolicIndexExpression(value: any): value is MetadataSymbolicIndexExpression;
export interface MetadataSymbolicCallExpression extends MetadataSymbolicExpression {
    __symbolic: 'call' | 'new';
    expression: MetadataValue;
    arguments?: MetadataValue[];
}
export declare function isMetadataSymbolicCallExpression(value: any): value is MetadataSymbolicCallExpression;
export interface MetadataSymbolicPrefixExpression extends MetadataSymbolicExpression {
    __symbolic: 'pre';
    operator: '+' | '-' | '~' | '!';
    operand: MetadataValue;
}
export declare function isMetadataSymbolicPrefixExpression(value: any): value is MetadataSymbolicPrefixExpression;
export interface MetadataSymbolicIfExpression extends MetadataSymbolicExpression {
    __symbolic: 'if';
    condition: MetadataValue;
    thenExpression: MetadataValue;
    elseExpression: MetadataValue;
}
export declare function isMetadataSymbolicIfExpression(value: any): value is MetadataSymbolicIfExpression;
export interface MetadataGlobalReferenceExpression extends MetadataSymbolicExpression {
    __symbolic: 'reference';
    name: string;
    arguments?: MetadataValue[];
}
export declare function isMetadataGlobalReferenceExpression(value: any): value is MetadataGlobalReferenceExpression;
export interface MetadataModuleReferenceExpression extends MetadataSymbolicExpression {
    __symbolic: 'reference';
    module: string;
}
export declare function isMetadataModuleReferenceExpression(value: any): value is MetadataModuleReferenceExpression;
export interface MetadataImportedSymbolReferenceExpression extends MetadataSymbolicExpression {
    __symbolic: 'reference';
    module: string;
    name: string;
    arguments?: MetadataValue[];
}
export declare function isMetadataImportedSymbolReferenceExpression(value: any): value is MetadataImportedSymbolReferenceExpression;
export interface MetadataImportedDefaultReferenceExpression extends MetadataSymbolicExpression {
    __symbolic: 'reference';
    module: string;
    default: boolean;
    arguments?: MetadataValue[];
}
export declare function isMetadataImportDefaultReference(value: any): value is MetadataImportedDefaultReferenceExpression;
export declare type MetadataSymbolicReferenceExpression = MetadataGlobalReferenceExpression | MetadataModuleReferenceExpression | MetadataImportedSymbolReferenceExpression | MetadataImportedDefaultReferenceExpression;
export declare function isMetadataSymbolicReferenceExpression(value: any): value is MetadataSymbolicReferenceExpression;
export interface MetadataSymbolicSelectExpression extends MetadataSymbolicExpression {
    __symbolic: 'select';
    expression: MetadataValue;
    name: string;
}
export declare function isMetadataSymbolicSelectExpression(value: any): value is MetadataSymbolicSelectExpression;
export interface MetadataSymbolicSpreadExpression extends MetadataSymbolicExpression {
    __symbolic: 'spread';
    expression: MetadataValue;
}
export declare function isMetadataSymbolicSpreadExpression(value: any): value is MetadataSymbolicSpreadExpression;
export interface MetadataError {
    __symbolic: 'error';
    /**
     * This message should be short and relatively discriptive and should be fixed once it is created.
     * If the reader doesn't recognize the message, it will display the message unmodified. If the
     * reader recognizes the error message is it free to use substitute message the is more
     * descriptive and/or localized.
     */
    message: string;
    /**
     * The line number of the error in the .ts file the metadata was created for.
     */
    line?: number;
    /**
     * The number of utf8 code-units from the beginning of the file of the error.
     */
    character?: number;
    /**
     * Context information that can be used to generate a more descriptive error message. The content
     * of the context is dependent on the error message.
     */
    context?: {
        [name: string]: string;
    };
}
export declare function isMetadataError(value: any): value is MetadataError;
