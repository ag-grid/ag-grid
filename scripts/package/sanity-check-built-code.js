/**
 * esbuild's `#private` helpers keep these error messages as string literals even when minified, and TypeScript's
 * tslib helpers keep their names, so either appearing means the code was built for a target below ES2022.
 */
const DOWNLEVELLED_PRIVATE_MEMBERS =
    /Cannot add the same private member more than once|(?:read from|write to) private field|access private method|__classPrivateField(?:Get|Set|In)\b/;

/**
 * Checks built JavaScript for signs it was not built the way the packages ship.
 * @param {string} code
 * @returns {string[]} a description of each problem found; empty when the code looks right
 */
function sanityCheckBuiltCode(code) {
    const problems = [];

    const downlevelled = code.match(DOWNLEVELLED_PRIVATE_MEMBERS);
    if (downlevelled) {
        problems.push(
            `contains downlevelled #private members ('${downlevelled[0]}'); is the build target below ES2022?`
        );
    }

    return problems;
}

module.exports = { sanityCheckBuiltCode };
