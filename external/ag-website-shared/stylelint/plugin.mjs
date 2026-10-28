import stylelint from 'stylelint';

import {
    collectDeclaredTokens,
    findVarReferences,
    isMalformedToken,
    isPaletteToken,
    isTokenShaped,
} from './tokens.mjs';

const {
    createPlugin,
    utils: { report, ruleMessages, validateOptions },
} = stylelint;

const meta = {
    url: 'https://github.com/ag-grid/ag-website-shared',
};

// Expire the declared token set after a few seconds so that a long-lived
// process (e.g. the stylelint LSP) picks up a newly declared token on the next
// lint instead of serving a stale set until it restarts.
const CACHE_TTL_MS = 5000;
let cached = null;

function getDeclaredTokens(tokenSources) {
    const key = tokenSources.join('\n');
    if (cached?.key !== key || cached.expiresAt <= Date.now()) {
        cached = { key, tokens: collectDeclaredTokens(tokenSources), expiresAt: Date.now() + CACHE_TTL_MS };
    }
    return cached.tokens;
}

function walkVarReferences(root, callback) {
    root.walkDecls((decl) => {
        if (!decl.value.includes('var(')) {
            return;
        }
        for (const reference of findVarReferences(decl.value)) {
            if (!reference.interpolated) {
                callback(decl, reference.name);
            }
        }
    });
}

const undeclaredRuleName = 'ag-website/no-undeclared-token';

const undeclaredMessages = ruleMessages(undeclaredRuleName, {
    rejected: (token) => `var(${token}) is not declared in the design system or any website stylesheet.`,
    malformed: (token) => `var(${token}) has a doubled hyphen, which is not a valid design system token name.`,
});

const noUndeclaredToken = (primary, secondaryOptions) => (root, result) => {
    const validOptions = validateOptions(
        result,
        undeclaredRuleName,
        { actual: primary },
        {
            actual: secondaryOptions,
            possible: { tokenSources: [(value) => typeof value === 'string'] },
        }
    );
    if (!validOptions) {
        return;
    }

    const declared = getDeclaredTokens(secondaryOptions.tokenSources);
    walkVarReferences(root, (decl, token) => {
        if (!isTokenShaped(token) || declared.has(token)) {
            return;
        }
        report({
            message: isMalformedToken(token) ? undeclaredMessages.malformed(token) : undeclaredMessages.rejected(token),
            node: decl,
            word: token,
            result,
            ruleName: undeclaredRuleName,
        });
    });
};

noUndeclaredToken.ruleName = undeclaredRuleName;
noUndeclaredToken.messages = undeclaredMessages;
noUndeclaredToken.meta = meta;

const paletteRuleName = 'ag-website/no-palette-token';

const paletteMessages = ruleMessages(paletteRuleName, {
    rejected: (token) =>
        `var(${token}) is a raw palette step that does not adapt to dark mode. Use a semantic or --color-util-* token instead.`,
});

const noPaletteToken = (primary) => (root, result) => {
    const validOptions = validateOptions(result, paletteRuleName, { actual: primary });
    if (!validOptions) {
        return;
    }

    walkVarReferences(root, (decl, token) => {
        if (!isPaletteToken(token)) {
            return;
        }
        report({
            message: paletteMessages.rejected(token),
            node: decl,
            word: token,
            result,
            ruleName: paletteRuleName,
        });
    });
};

noPaletteToken.ruleName = paletteRuleName;
noPaletteToken.messages = paletteMessages;
noPaletteToken.meta = meta;

export default [createPlugin(undeclaredRuleName, noUndeclaredToken), createPlugin(paletteRuleName, noPaletteToken)];
