import type { Framework } from '@ag-grid-types';
import { getFrameworkDisplayText } from '@utils/framework';
import { getFirstParagraphText } from '@utils/markdoc/getFirstParagraphText';

interface Params {
    framework: Framework;
    pageDescription: string;
    body: string;
}

export function getPageDescription({ framework, pageDescription, body }: Params) {
    const frameworkDisplayText = getFrameworkDisplayText(framework);
    return pageDescription
        ? pageDescription.replaceAll('$framework', frameworkDisplayText) // Use front-matter description
        : getFirstParagraphText(body, framework); // Default to 1st paragraph text
}
