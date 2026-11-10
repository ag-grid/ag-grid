/**
 * `#private` class members compile to WeakMap-backed helpers when a build target predates ES2022, which costs
 * size and speed. esbuild's helpers keep their error messages as string literals even when minified, and
 * TypeScript's tslib helpers keep their names, so either appearing means a build lowered private members.
 */
const DOWNLEVELLED_PRIVATE_MEMBERS =
    /Cannot add the same private member more than once|(?:read from|write to) private field|access private method|__classPrivateField(?:Get|Set|In)\b/;

module.exports = { DOWNLEVELLED_PRIVATE_MEMBERS };
