/** Escape a value for use inside a GFM table cell (pipes, newlines). */
export function escapeTableCell(value: string): string {
    return value.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
}

/**
 * Build a GitHub-flavoured markdown table. `headers` defines the columns; each
 * row is an array of already-formatted cell strings (markdown allowed). Cells are
 * escaped for pipes/newlines. Returns an empty string when there are no rows, so
 * callers can drop an empty table cleanly.
 */
export function markdownTable(headers: string[], rows: string[][]): string {
    if (rows.length === 0) {
        return '';
    }
    const headerLine = `| ${headers.map(escapeTableCell).join(' | ')} |`;
    const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;
    const bodyLines = rows.map((row) => `| ${row.map((cell) => escapeTableCell(cell ?? '')).join(' | ')} |`);
    return [headerLine, separatorLine, ...bodyLines].join('\n');
}
