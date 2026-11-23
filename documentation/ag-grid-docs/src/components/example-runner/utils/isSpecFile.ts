/**
 * Whether an example file is a test (`*.spec.*` or `*.test.*`), which the code viewer and exports leave out.
 * Kept free of imports so `scripts/validate-generated-examples.ts` can apply the same rule.
 */
export const isSpecFile = (fileName: string) => fileName.includes('.spec.') || fileName.includes('.test.');
