import selectorParser from 'postcss-selector-parser';
import stylelint from 'stylelint';

const {
    createPlugin,
    utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'ag/no-low-performance-key-selector';

const messages = ruleMessages(ruleName, {
    rejected: (keySelector) =>
        `Low-performance key selector "${keySelector}". See LOW_PERFORMANCE_SELECTORS.md for fixing advice.`,
    rejectedMultiple: (count, selectors) =>
        `${count} Low-performance key selectors: ${selectors}. See LOW_PERFORMANCE_SELECTORS.md for fixing advice.`,
});

const meta = {
    url: 'https://github.com/ag-grid/ag-grid',
};

// Combinator types that separate compound selectors
// Note: "nesting" (&) is NOT a combinator - it's part of the compound selector
const COMBINATOR_TYPES = new Set(['combinator']);

// Don't consider these pseudo-elements or pseudo-classes low performance,
// because they match very fast and won't require checking every element
const HIGH_PERF_PSEUDOS = new Set([
    '::-webkit-outer-spin-button',
    '::-webkit-inner-spin-button',
    '::-webkit-slider-runnable-track',
    '::-webkit-slider-thumb',
    '::-moz-range-track',
    '::-moz-ag-range-thumb',
    '::placeholder',
    ':disabled',
    ':invalid',
    ':active',
    ':focus',
    ':focus-visible',
    /* NOTE: do not add :hover here, it feels like it should be high-perf, but
       actually causes slow-path matching against every element in the DOM */
]);

/**
 * Check if a pseudo selector is high-performance.
 * This includes whitelisted pseudos and :where/:is containing a single high-perf selector.
 */
function pseudoIsHighPerformance(pseudo) {
    const name = pseudo.value.toLowerCase();

    if (HIGH_PERF_PSEUDOS.has(name)) {
        return true;
    }

    // Check if :where/:is contains a single high-perf selector
    if (name !== ':where' && name !== ':is') {
        return false;
    }

    // Get the selectors inside the pseudo
    const innerSelectors = pseudo.nodes;
    if (!innerSelectors || innerSelectors.length !== 1) {
        return false;
    }

    const innerSelector = innerSelectors[0];
    if (innerSelector.type !== 'selector') {
        return false;
    }

    // Recursively check if the inner selector is high-performance
    return isHighPerformance(innerSelector.nodes);
}

/**
 * Check if a compound selector (array of nodes) is high performance.
 * High performance means it contains a class, ID, standalone nesting selector (&),
 * :where/:is with a single high-perf selector, or whitelisted pseudos.
 *
 * Note: "&" alone is high-perf (resolves to parent class), but "&:after" is NOT
 * because Chrome treats the nested pseudo-element differently.
 */
function isHighPerformance(nodes) {
    for (const node of nodes) {
        if (node.type === 'class' || node.type === 'id') {
            return true;
        }
        // Custom elements (containing dashes) are high-performance
        if (node.type === 'tag' && node.value.includes('-')) {
            return true;
        }
        if (node.type === 'pseudo' && pseudoIsHighPerformance(node)) {
            return true;
        }
    }
    // Standalone "&" is high-perf (resolves to parent selector, if the parent
    // selector is not high perf it'll get flagged separately)
    if (nodes.length === 1 && nodes[0].type === 'nesting') {
        return true;
    }
    return false;
}

/**
 * Extract the key selector nodes from a parsed selector.
 * The key selector is the rightmost compound selector after the last combinator or nesting boundary.
 */
function extractKeySelector(selector) {
    const nodes = selector.nodes;
    let lastCombinatorIndex = -1;

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (COMBINATOR_TYPES.has(node.type)) {
            lastCombinatorIndex = i;
        }
    }

    // Key selector is everything after the last combinator (or the whole thing if no combinator)
    return nodes.slice(lastCombinatorIndex + 1);
}

/**
 * Convert key selector nodes to a string representation.
 */
function keySelectorToString(nodes) {
    return nodes.map((n) => n.toString()).join('');
}

const ruleFunction = (primary) => {
    return (root, result) => {
        const validOptions = validateOptions(result, ruleName, {
            actual: primary,
        });

        if (!validOptions) {
            return;
        }

        root.walkRules((rule) => {
            // Skip keyframes rules
            if (rule.parent && rule.parent.type === 'atrule' && /^(-webkit-)?keyframes$/i.test(rule.parent.name)) {
                return;
            }

            let parsed;
            try {
                parsed = selectorParser().astSync(rule.selector);
            } catch {
                // Skip invalid selectors
                return;
            }

            // Collect all low-performance key selectors in this rule
            const lowPerfSelectors = [];

            parsed.each((selector) => {
                if (selector.type !== 'selector') {
                    return;
                }

                const keyNodes = extractKeySelector(selector);
                if (keyNodes.length === 0) {
                    return;
                }

                if (!isHighPerformance(keyNodes)) {
                    const keyString = keySelectorToString(keyNodes);
                    lowPerfSelectors.push(keyString);
                }
            });

            // Report once per rule, listing all low-performance selectors
            if (lowPerfSelectors.length > 0) {
                const message =
                    lowPerfSelectors.length === 1
                        ? messages.rejected(lowPerfSelectors[0])
                        : messages.rejectedMultiple(
                              lowPerfSelectors.length,
                              lowPerfSelectors.map((s) => `"${s.trim()}"`).join(', ')
                          );

                report({
                    message,
                    node: rule,
                    result,
                    ruleName,
                });
            }
        });
    };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
