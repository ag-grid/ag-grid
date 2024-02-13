export const createExtractLinesBetween = (contents: string, transformLine?: (line: string) => string) => {
    const contentsArray = contents.split('\n');

    return ({ startLine, endLine }: { startLine: number; endLine: number }) => {
        const startIndex = Math.max(0, Math.min(contentsArray.length - 1, startLine)) - 1;
        const endIndex = Math.max(0, Math.min(contentsArray.length - 1, endLine));

        const slicedLines = contentsArray.slice(startIndex, endIndex);
        const extractedLines = transformLine ? slicedLines.map(transformLine) : slicedLines;

        return extractedLines.join('\n');
    };
};
