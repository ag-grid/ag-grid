import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import stylelint from 'stylelint';

const {
    createPlugin,
    utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'ag/no-unknown-theme-variable';

const messages = ruleMessages(ruleName, {
    rejected: (variable) =>
        `var(${variable}) does not match a theme param. CSS variables not derived from a theme param must be prefixed --ag-internal-.`,
});

const meta = {
    url: 'https://github.com/ag-grid/ag-grid',
};

// Repo root, derived from this file's location so config paths can be
// specified relative to the repo root regardless of the linting cwd
// (nx runs stylelint with cwd set to each project root).
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

// Matches an interface member declaration such as `    accentColor: ColorValue;`
const PARAM_DECLARATION = /^\s+(\w+): \w+Value;$/;

// Mirrors paramToVariableName in packages/ag-stack/src/theming/themeUtils.ts
const kebabCase = (str) => str.replace(/[A-Z]|\d+/g, (m) => `-${m}`).toLowerCase();
const paramToVariableName = (paramName) => `--ag-${kebabCase(paramName)}`;

// Matches var(--ag-…) references, capturing the variable name
const VAR_REFERENCE = /var\(\s*(--ag-[\w-]+)/g;

// Variables not derived from a theme param are permitted if prefixed thus
const INTERNAL_PREFIX = /^--ag-internal-/;

// Expire the derived variable set in a few seconds so that editing a source
// file is picked up on the next lint within a long-lived process (e.g. the
// stylelint LSP), rather than serving a stale param set until the process
// restarts.
const CACHE_TTL_MS = 5000;
let cachedVariables = null;
let cacheExpiresAt = 0;

function getAllowedVariables(paramSourceFiles) {
    // No source files means no valid variables, so every var(--ag-…) is
    // unknown. Skip the cache entirely here: it is not keyed on the file list,
    // so caching the empty set could poison a later run that does have files.
    if (paramSourceFiles.length === 0) {
        return new Set();
    }

    if (cachedVariables && cacheExpiresAt > Date.now()) {
        return cachedVariables;
    }

    const allowed = new Set();
    for (const file of paramSourceFiles) {
        const path = isAbsolute(file) ? file : resolve(REPO_ROOT, file);
        const source = readFileSync(path, 'utf8');
        const lines = source.split('\n');
        for (let i = 0, len = lines.length; i < len; ++i) {
            const match = PARAM_DECLARATION.exec(lines[i]);
            if (match) {
                allowed.add(paramToVariableName(match[1]));
            }
        }
    }

    cachedVariables = allowed;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return allowed;
}

const ruleFunction = (primary, secondaryOptions) => {
    return (root, result) => {
        const validOptions = validateOptions(
            result,
            ruleName,
            {
                actual: primary,
            },
            {
                actual: secondaryOptions,
                possible: {
                    paramSourceFiles: [(value) => typeof value === 'string'],
                    publicOutputVariables: [(value) => typeof value === 'string'],
                },
                optional: true,
            }
        );

        if (!validOptions) {
            return;
        }

        const paramSourceFiles = secondaryOptions?.paramSourceFiles ?? [];
        const allowedVariables = getAllowedVariables(paramSourceFiles);
        const publicOutputVariables = new Set(secondaryOptions?.publicOutputVariables ?? []);

        root.walkDecls((decl) => {
            const value = decl.value;
            if (!value.includes('var(')) {
                return;
            }

            VAR_REFERENCE.lastIndex = 0;
            let match;
            while ((match = VAR_REFERENCE.exec(value)) !== null) {
                const variable = match[1];
                if (
                    allowedVariables.has(variable) ||
                    publicOutputVariables.has(variable) ||
                    INTERNAL_PREFIX.test(variable)
                ) {
                    continue;
                }

                report({
                    message: messages.rejected(variable),
                    node: decl,
                    word: variable,
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
