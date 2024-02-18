interface ValidateOptions {
    optional?: boolean;
}
interface ValidationContext extends ValidateOptions {
    target: any;
    property: string | symbol;
}
export interface ValidatePredicate {
    (value: unknown, ctx: ValidationContext): boolean;
    message?: string | ((ctx: ValidationContext) => string);
}
export interface ValidateArrayPredicate extends ValidatePredicate {
    restrict(options: {
        length?: number;
        minLength?: number;
    }): ValidatePredicate;
}
export interface ValidateNumberPredicate extends ValidatePredicate {
    restrict(options: {
        min?: number;
        max?: number;
    }): ValidatePredicate;
}
export interface ValidateObjectPredicate extends ValidatePredicate {
    restrict(objectType: Function): ValidatePredicate;
}
export declare function Validate(predicate: ValidatePredicate, options?: ValidateOptions): PropertyDecorator;
export declare const AND: (...predicates: ValidatePredicate[]) => ValidatePredicate;
export declare const OR: (...predicates: ValidatePredicate[]) => ValidatePredicate;
export declare const OBJECT: ValidateObjectPredicate;
export declare const BOOLEAN: ValidatePredicate;
export declare const FUNCTION: ValidatePredicate;
export declare const STRING: ValidatePredicate;
export declare const NUMBER: ValidateNumberPredicate;
export declare const NAN: ValidatePredicate;
export declare const POSITIVE_NUMBER: ValidatePredicate;
export declare const RATIO: ValidatePredicate;
export declare const DEGREE: ValidatePredicate;
export declare const NUMBER_OR_NAN: ValidatePredicate;
export declare const ARRAY: ValidateArrayPredicate;
export declare const ARRAY_OF: (predicate: ValidatePredicate, message?: ValidatePredicate['message']) => ValidatePredicate;
export declare const LESS_THAN: (otherField: string) => ValidatePredicate;
export declare const GREATER_THAN: (otherField: string) => ValidatePredicate;
export declare const DATE: ValidatePredicate;
export declare const DATE_OR_DATETIME_MS: ValidatePredicate;
export declare const COLOR_STRING: ValidatePredicate;
export declare const COLOR_STRING_ARRAY: ValidatePredicate;
export declare const BOOLEAN_ARRAY: ValidatePredicate;
export declare const NUMBER_ARRAY: ValidatePredicate;
export declare const STRING_ARRAY: ValidatePredicate;
export declare const DATE_ARRAY: ValidatePredicate;
export declare const OBJECT_ARRAY: ValidatePredicate;
export declare const LINE_CAP: ValidatePredicate;
export declare const LINE_JOIN: ValidatePredicate;
export declare const LINE_DASH: ValidatePredicate;
export declare const POSITION: ValidatePredicate;
export declare const FONT_STYLE: ValidatePredicate;
export declare const FONT_WEIGHT: ValidatePredicate;
export declare const TEXT_WRAP: ValidatePredicate;
export declare const TEXT_ALIGN: ValidatePredicate;
export declare const VERTICAL_ALIGN: ValidatePredicate;
export declare const OVERFLOW_STRATEGY: ValidatePredicate;
export declare const DIRECTION: ValidatePredicate;
export declare const PLACEMENT: ValidatePredicate;
export declare const INTERACTION_RANGE: ValidatePredicate;
export declare function UNION(options: string[], message?: string): ValidatePredicate;
export declare const MIN_SPACING: ValidatePredicate;
export declare const MAX_SPACING: ValidatePredicate;
export declare function predicateWithMessage(predicate: ValidatePredicate, message: Exclude<ValidatePredicate['message'], undefined>): ValidatePredicate;
export declare function stringify(value: any): string;
export {};
