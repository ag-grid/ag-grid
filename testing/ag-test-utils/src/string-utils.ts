export function escapeQuotes(value: string): string {
    return value.replaceAll(/(['"])/g, '\\$1');
}

export function optionalEscapeString(s: string): string {
    // Bare identifier or all-digit literal — no quoting needed.
    if (/^(?!\d)\w[._-\w]*$|^\d+$/.test(s)) {
        return s;
    }
    // For strings containing control chars, backslash, or both quote styles we fall back to
    // `JSON.stringify` (whose `\"` form would need ugly double-backslash escaping in the snapshot
    // template literal — kept as a last resort).
    if (/[\n\r\t\\]/.test(s)) {
        return JSON.stringify(s);
    }
    const hasDouble = s.includes('"');
    const hasSingle = s.includes("'");
    // String has `"` but no `'` → wrap in single quotes (avoids `\"` in the snapshot source).
    if (hasDouble && !hasSingle) {
        return `'${s}'`;
    }
    // Fallback to the historical double-quoted form. JSON.stringify handles any remaining edge
    // case where the string mixes both quote styles.
    return JSON.stringify(s);
}

export function unindentText(text: TemplateStringsArray | string | string[] | null | undefined): string {
    let lines: string[];
    if (Array.isArray(text)) {
        if ('raw' in text) {
            lines = String(text).split('\n');
        } else {
            lines = text;
        }
    } else {
        lines = String(text).split('\n');
    }
    lines = lines.filter((line) => line.trim().length > 0).map((line) => line.trimEnd());
    const minIndent = Math.min(...lines.map((line) => line.match(/^\s*/)?.[0].length ?? 0));
    if (minIndent > 0) {
        lines = lines.map((line) => line.slice(minIndent));
    }
    return lines.join('\n');
}
