/**
 * Returns all word tokens (\w+) found in a type expression, ignoring anything inside string literals.
 *
 * - Recognises single-quoted, double-quoted and template string literals and skips their contents.
 * - Outside of strings, collects consecutive word characters [A-Za-z0-9_].
 * - No other parsing or filtering is applied.
 * - exclude browser global classes and common typescript types that should not be processed.
 *
 * This is required to avoid the situation where for example EnumType = 'XxX' | 'Context'; will incorrectly process type Context that is internal.
 *
 * Example:
 *   Input:  "Xxx<'Context', TData> | Baz[]"
 *   Output: Set { "Xxx", "TData", "Baz" }
 */
export function getAllPotentialTypesFromString(type: string): string[] {
    const set = new Set<string>();
    let inString: '"' | "'" | '`' | null = null;
    let escaping = false;
    let token = '';

    for (let i = 0, len = type.length; i < len; ++i) {
        const ch = type[i];

        if (inString) {
            if (escaping) {
                escaping = false;
                continue;
            }
            if (ch === '\\') {
                escaping = true;
                continue;
            }
            if (ch === inString) {
                inString = null;
            }
            continue;
        }

        if (ch === '"' || ch === "'" || ch === '`') {
            addType(set, token);
            inString = ch;
            continue;
        }

        if (charIsWord(ch)) {
            token += ch;
        } else {
            addType(set, token);
        }
    }
    addType(set, token);
    return Array.from(set);
}

const charIsWord = (ch: string) =>
    (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch === '_';

const charIsNumber = (ch: string) => ch >= '0' && ch <= '9';

const commonTsTypes = new Set<string>([
    'Array',
    'BigInt',
    'Date',
    'Error',
    'Exclude',
    'Extract',
    'InstanceType',
    'Iterable',
    'IterableIterator',
    'Iterator',
    'Map',
    'NonNullable',
    'Omit',
    'Parameters',
    'Partial',
    'Pick',
    'Promise',
    'Readonly',
    'ReadonlyArray',
    'Record',
    'RegExp',
    'Required',
    'ReturnType',
    'Set',
    'Symbol',
    'ThisType',
    'WeakMap',
    'WeakSet',
    'any',
    'boolean',
    'false',
    'function',
    'never',
    'null',
    'number',
    'object',
    'string',
    'true',
    'undefined',
    'unknown',
    'void',
]);

function addType(set: Set<string>, token: string) {
    if (token.length && !charIsNumber(token[0]) && !commonTsTypes.has(token)) {
        set.add(token);
        token = '';
    }
}
