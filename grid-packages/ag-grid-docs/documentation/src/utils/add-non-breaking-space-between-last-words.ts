/**
 * Add a non-breaking space `&nbsp;` between the last words, so it does not break
 * onto the next line and create widows
 */
export const addNonBreakingSpaceBetweenLastWords = (text: string) => {
    const nonBreakingSpace = '\u00A0';
    return text.replace(/\s+(\S+)(\s*)$/, `${nonBreakingSpace}$1`);
};
