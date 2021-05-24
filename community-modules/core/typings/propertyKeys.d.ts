/**
 * These keys are used for validating properties supplied on a gridOptions object, and for code generation.
 * If you change the properties on the gridOptions interface, you *must* update this file as well to be consistent.
 */
export declare class PropertyKeys {
    static STRING_PROPERTIES: string[];
    static OBJECT_PROPERTIES: string[];
    static ARRAY_PROPERTIES: string[];
    static NUMBER_PROPERTIES: string[];
    static BOOLEAN_PROPERTIES: string[];
    /** You do not need to include event callbacks in this list, as they are generated automatically. */
    static FUNCTION_PROPERTIES: string[];
    static ALL_PROPERTIES: string[];
    /**
     * Used when performing property checks. This avoids noise caused when using frameworks, which can add their own
     * framework-specific properties to colDefs, gridOptions etc.
     */
    static FRAMEWORK_PROPERTIES: string[];
}
