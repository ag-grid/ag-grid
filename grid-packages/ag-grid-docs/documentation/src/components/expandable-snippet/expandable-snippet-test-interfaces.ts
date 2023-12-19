// Regenerate the generated JSON files with metadata about these types using:
// npx lerna run generate-doc-files --scope @ag-grid-community/all-modules

/** JSDoc for TypeAliasExample. */
export type TypeAliasExample = 'this' | 'that' | 'the-other';

/** JSDoc for TestFnBaseArgs. */
export interface TestFnBaseArgs {
    param1: number;
    param2: string;
    param3: boolean;
}

/** JSDoc for TestFnArgs. */
export interface TestFnArgs extends TestFnBaseArgs {
    param4: TestFnNestedResult;
}

/** JSDoc for TestFnResult. */
export interface TestFnResult {
    resultPrimitive: number;
    resultObject: TestFnNestedResult[];
}

/** JSDoc for TestFnNestedResult. */
export interface TestFnNestedResult {
    primitiveNumber: number;
    primitiveString: number;
}

/** JSDoc for TestUnionBaseElement. */
export interface TestUnionBaseElement {
    parentProperty: string;
}

/** JSDoc for TestUnionElement1. */
export interface TestUnionElement1 extends TestUnionBaseElement {
    type: 'union-element-1',
    property: string;
    nestedProperty: TestFnResult;
}

/** JSDoc for TestUnionElement2. */
export interface TestUnionElement2 extends TestUnionBaseElement {
    type: 'union-element-2',
    property: string;
    nestedProperty: TestFnResult;
}

/** JSDoc for TestUnionElement3. */
export interface TestUnionElement3 extends TestUnionBaseElement {
    type: 'union-element-3',
    property: string;
    nestedProperty: TestFnResult;
}

/** JSDoc for TestTypeUnion. */
export type TestTypeUnion = TestUnionElement1 | TestUnionElement2 | TestUnionElement3;

/** JSDoc for TestOmitExtension. */
export interface TestOmitExtension extends Omit<TestFnArgs, 'param1'>, TestFnResult {
    concreteProperty: string;
}

/** JSDocs for ExpandableSnippetTestInterface. */
export interface ExpandableSnippetTestInterface {
    /** JSDoc for primitiveString. */
    primitiveString: string;
    /** JSDoc for primitiveNumber. */
    primitiveNumber: number;
    /** JSDoc for primitiveBoolean. */
    primitiveBoolean: boolean;
    /** JSDoc for primitiveOptional. */
    primitiveOptional?: string;

    /** This is a simple alias field. */
    simpleAlias: TypeAliasExample;

    /** JSDoc for primitiveArray. */
    primitiveArray: string[][];
    /** JSDoc for objectArray. */
    objectArray: TestFnResult[];

    /** JSDoc for typeUnion. */

    typeUnion?: TestTypeUnion;
    /** JSDoc for typeUnionArray. */
    typeUnionArray: TestTypeUnion[];

    /** JSDoc for simpleFn. */
    simpleFn: (a: number, b: string, c: boolean) => number;
    /** JSDoc for complexFn. */
    complexFn: (test: TestFnArgs) => TestFnResult;

    /** JSDoc for simpleOmit. */
    simpleOmit?: Omit<TestFnResult, 'resultPrimitive'>;
    /** JSDoc for complexOmit. */
    complexOmit?: TestOmitExtension;

    /** This is a deprecated field. @deprecated */
    deprecatedField: string;
}

