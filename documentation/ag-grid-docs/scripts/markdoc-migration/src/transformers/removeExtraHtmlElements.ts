/**
 * Replace HTML comments with JavaScript comments
 */
function replaceHtmlComments(contents: string) {
    const regex = /<!--(.*)-->/g;
    const hasHtmlComment = Boolean(contents.match(regex));
    const replacedContents = contents.replaceAll(regex, '/* $1 */');

    return {
        warnings: hasHtmlComment ? ['html comment removed'] : [],
        replacedContents,
    };
}

function replaceHeadings(contents: string) {
    const warnings = [];
    let replacedContents = contents;
    {
        const h2Regex = /(<h2([^>]+)>)(.*)(<\/h2>)/g;
        const hasH2 = Boolean(replacedContents.match(h2Regex));
        replacedContents = replacedContents.replaceAll(h2Regex, '## $3');
        if (hasH2) {
            warnings.push('h2 removed');
        }
    }

    {
        const h3Regex = /(<h3([^>]+)>)(.*)(<\/h3>)/g;
        const hasH3 = Boolean(replacedContents.match(h3Regex));
        replacedContents = replacedContents.replaceAll(h3Regex, '### $3');
        if (hasH3) {
            warnings.push('h3 removed');
        }
    }

    return {
        warnings,
        replacedContents,
    };
}

function replaceResponsiveParagraph(contents: string) {
    const warnings = [];
    let replacedContents = contents;
    const regex = /<p([^>]*)>(.*)<\/p>/g;
    const hasMatch = Boolean(replacedContents.match(regex));
    replacedContents = replacedContents.replaceAll(regex, '$2');
    if (hasMatch) {
        warnings.push('p.font-size-responsive removed');
    }

    return {
        warnings,
        replacedContents,
    };
}

export function removeExtraHtmlElements(contents: string) {
    const htmlCommentsResult = replaceHtmlComments(contents);
    const replacedHeadingsResult = replaceHeadings(htmlCommentsResult.replacedContents);
    const replacedResponsiveParagraphResult = replaceResponsiveParagraph(replacedHeadingsResult.replacedContents);

    const replacedContents = replacedResponsiveParagraphResult.replacedContents;

    return {
        warnings: [
            ...htmlCommentsResult.warnings,
            ...replacedHeadingsResult.warnings,
            ...replacedResponsiveParagraphResult.warnings,
        ],
        replacedContents,
    };
}
