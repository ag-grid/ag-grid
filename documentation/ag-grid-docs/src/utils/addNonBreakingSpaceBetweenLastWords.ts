/**
 * Add a non-breaking space `&nbsp;` between the last words, so it does not break
 * onto the next line and create widows
 */
export const addNonBreakingSpaceBetweenLastWords = (text: string) => {
    if (!text || !text.replace) {
        // eslint-disable-next-line no-console
        console.log('Text supplied to addNonBreakingSpaceBetweenLastWords is null or undefined');
        return '';
    }
    return text.replace(/\s+(\S+)(\s*)$/, '\u00A0$1');
};
