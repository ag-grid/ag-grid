export const DARK_MODE_START = '/** DARK MODE START **/';
export const DARK_MODE_END = '/** DARK MODE END **/';
export const CONSOLE_LOG_START = '/** CONSOLE LOG START **/';
export const CONSOLE_LOG_END = '/** CONSOLE LOG END **/';

export const DARK_MODE_REGEX = getSnippetRegex({ startDelimiter: DARK_MODE_START, endDelimiter: DARK_MODE_END });
export const CONSOLE_LOG_REGEX = getSnippetRegex({ startDelimiter: CONSOLE_LOG_START, endDelimiter: CONSOLE_LOG_END });

/**
 * Return a regex that matches a snippet of text between specified delimiters.
 */
export function getSnippetRegex({ startDelimiter, endDelimiter }: { startDelimiter: string; endDelimiter: string }) {
    const escapedStart = startDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedEnd = endDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\s*${escapedStart}[\\s\\S]*?${escapedEnd}\\s*`, 'g');

    return regex;
}
