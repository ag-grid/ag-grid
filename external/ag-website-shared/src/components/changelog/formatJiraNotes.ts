// Jira's `renderedFields` for these plain-text fields are wiki markup with HTML escaped, not HTML;
// older notes carry Markdown backticks, fenced blocks or raw HTML instead.

// Kept as is, except `<br>`, which the list conversion needs to see.
const EXISTING_MARKUP = /<pre\b[\s\S]*?<\/pre>|<code\b[\s\S]*?<\/code>|<a\b[\s\S]*?<\/a>|<(?!br\b)[^>]+>/gi;
const FENCED_BLOCK = /```[^\n]*\n([\s\S]*?)\n?```/g;
// Code ending in `}` renders as `}}}`, so a span closes at the last brace of the run.
const WIKI_CODE = /\{\{(.+?)\}\}(?!\})/g;
// Paired per line; a line with a stray backtick is skipped, as it would shift every pair after it.
const LINE_WITH_BACKTICKS = /^.*`.*$/gm;
const BACKTICK_CODE = /`([^`]+)`/g;
const LINE_BREAK = /(\r\n|\n|\r)/;
// `*` only: older notes use `#` for Markdown headings, not Jira numbered lists.
const LIST_ITEM = /^(\*+)[ \t]+(.*)$/;
const TRAILING_BREAK = /<br\s*\/?>\s*$/i;
const BREAK_BEFORE_LIST = /(<br\s*\/?>)?(\r\n|\n|\r)$/i;
// Private-use characters, which never appear in a note, mark where protected markup goes back.
const PLACEHOLDER = /(\d+)/g;

export function formatJiraNotes(notes: string): string {
    const protectedMarkup: string[] = [];
    const protect = (html: string) => `${protectedMarkup.push(html) - 1}`;

    const text = notes
        .replace(FENCED_BLOCK, (_, code) => protect(`<pre>${code}</pre>`))
        .replace(EXISTING_MARKUP, protect)
        .replace(WIKI_CODE, (_, code) => `<code>${code}</code>`)
        .replace(LINE_WITH_BACKTICKS, convertBackticks);

    return convertBulletLists(text).replace(PLACEHOLDER, (_, index) => protectedMarkup[Number(index)]);
}

function convertBackticks(line: string): string {
    const hasStrayBacktick = line.split('`').length % 2 === 0;
    return hasStrayBacktick ? line : line.replace(BACKTICK_CODE, (_, code) => `<code>${code}</code>`);
}

/** Line breaks around a list are dropped, since the callers turn each remaining newline into a `<br>`. */
function convertBulletLists(text: string): string {
    // Odd indices hold the line breaks, so they can be kept as they were outside lists.
    const parts = text.split(LINE_BREAK);
    let html = '';
    let index = 0;

    while (index < parts.length) {
        const items: ListItem[] = [];
        let match: RegExpExecArray | null;
        while (index < parts.length && (match = LIST_ITEM.exec(parts[index]))) {
            items.push({ depth: match[1].length, content: match[2].replace(TRAILING_BREAK, '') });
            index += 2;
        }

        if (items.length) {
            // The break ending the list was skipped with it; drop the one before it, `<br>` included.
            html = html.replace(BREAK_BEFORE_LIST, '') + listHtml(items);
        } else {
            html += parts[index] + (parts[index + 1] ?? '');
            index += 2;
        }
    }

    return html;
}

interface ListItem {
    depth: number;
    content: string;
}

function listHtml(items: ListItem[]): string {
    let html = '';
    let depth = 0;

    for (const item of items) {
        if (item.depth <= depth) {
            html += '</li>' + '</ul></li>'.repeat(depth - item.depth);
        }
        html += '<ul>'.repeat(Math.max(item.depth - depth, 0)) + `<li>${item.content}`;
        depth = item.depth;
    }

    return html + '</li></ul>'.repeat(depth);
}
