// Reads Sass-only design tokens by parsing the design system's own source files.
//
// Spacing sizes, breakpoints and the transition timing are plain Sass variables - they never
// become custom properties, so the stylesheet scan in `tokens.ts` cannot see them. Rather than
// restate the values in TypeScript (which is how the old Spacing section drifted), the guide
// imports the `.scss` files as raw text and parses the declarations out. Adding a breakpoint to
// `core/_breakpoints.scss` is therefore all it takes for it to appear here.

export interface SassVariable {
    /** Variable name without the `$`. */
    name: string;
    /** Declared value, with `!default` stripped. */
    value: string;
    /** Numeric part of the value in px, when the value is a px literal. */
    px?: number;
    /** Trailing `//` comment on the declaration line, if any. */
    note?: string;
    /**
     * Index of the blank-line-separated block the declaration sits in. Blocks are how
     * `_breakpoints.scss` groups per-component breakpoints, so preserving them preserves the
     * author's own grouping.
     */
    block: number;
}

const DECLARATION = /^\s*\$([\w-]+)\s*:\s*([^;]+);(?:\s*\/\/\s*(.*))?$/;

/**
 * Parses `$name: value;` declarations out of Sass source text.
 *
 * Deliberately shallow: it skips anything inside braces (mixins, nested rules) so only top-level
 * token declarations are picked up, and it does not evaluate expressions. A declaration whose
 * value references another variable is returned verbatim for the caller to resolve.
 */
export const parseSassVariables = (source: string): SassVariable[] => {
    const variables: SassVariable[] = [];
    let block = 0;
    let depth = 0;
    let sawDeclarationInBlock = false;

    for (const line of source.split('\n')) {
        depth += (line.match(/\{/g)?.length ?? 0) - (line.match(/\}/g)?.length ?? 0);

        if (line.trim() === '') {
            if (sawDeclarationInBlock) {
                ++block;
                sawDeclarationInBlock = false;
            }
            continue;
        }

        if (depth > 0) {
            continue;
        }

        const match = DECLARATION.exec(line);
        if (!match) {
            continue;
        }

        const [, name, rawValue, note] = match;
        const value = rawValue.replace('!default', '').trim();
        const px = /^-?[\d.]+px$/.test(value) ? Number.parseFloat(value) : undefined;

        variables.push({ name, value, px, note: note?.trim(), block });
        sawDeclarationInBlock = true;
    }

    return variables;
};

/** Resolves single-level `$other` aliases within a parsed set, leaving anything else untouched. */
export const resolveSassAliases = (variables: SassVariable[]): SassVariable[] => {
    const byName = new Map(variables.map((variable) => [variable.name, variable]));

    return variables.map((variable) => {
        const alias = /^\$([\w-]+)$/.exec(variable.value);
        const target = alias && byName.get(alias[1]);
        return target ? { ...variable, value: target.value, px: target.px } : variable;
    });
};

/** Variables that carry a px value, ascending. Used for the spacing and breakpoint scales. */
export const pxVariables = (variables: SassVariable[]): SassVariable[] =>
    variables.filter((variable) => variable.px != null).sort((a, b) => a.px! - b.px!);
