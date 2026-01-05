export const DARK_MODE_START = '/** DARK MODE START **/';
export const DARK_MODE_END = '/** DARK MODE END **/';

export const CONSOLE_LOG_START = '/** CONSOLE LOG START **/';
export const CONSOLE_LOG_END = '/** CONSOLE LOG END **/';

export const DARK_INTEGRATED_START = '/** DARK INTEGRATED START **/';
export const DARK_INTEGRATED_END = '/** DARK INTEGRATED END **/';

export const TEAR_DOWN_START = '/** TEAR DOWN START **/';
export const TEAR_DOWN_END = '/** TEAR DOWN END **/';

export const TEST_ID_START = '/** ENABLE AG-TEST-ID START **/';
export const TEST_ID_END = '/** ENABLE AG-TEST-ID END **/';

export const DARK_MODE_REGEX = getSnippetRegex({ startDelimiter: DARK_MODE_START, endDelimiter: DARK_MODE_END });
export const CONSOLE_LOG_REGEX = getSnippetRegex({ startDelimiter: CONSOLE_LOG_START, endDelimiter: CONSOLE_LOG_END });
export const DARK_INTEGRATED_REGEX = getSnippetRegex({
    startDelimiter: DARK_INTEGRATED_START,
    endDelimiter: DARK_INTEGRATED_END,
});
export const TEAR_DOWN_REGEX = getSnippetRegex({ startDelimiter: TEAR_DOWN_START, endDelimiter: TEAR_DOWN_END });
export const TEST_ID_REGEX = getSnippetRegex({ startDelimiter: TEST_ID_START, endDelimiter: TEST_ID_END });

/**
 * Return a regex that matches a snippet of text between specified delimiters.
 */
export function getSnippetRegex({ startDelimiter, endDelimiter }: { startDelimiter: string; endDelimiter: string }) {
    const escapedStart = startDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedEnd = endDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\s*${escapedStart}[\\s\\S]*?${escapedEnd} *`, 'g');

    return regex;
}
