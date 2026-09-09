import type { Framework } from '@ag-grid-types';
import { getPageDescription } from '@ag-website-shared/utils/getPageDescription';

/**
 * The same text the HTML page puts in its meta description, so the twin and the page agree.
 *
 * `getFirstParagraphText` joins inline nodes that already carry their own spacing, leaving a
 * doubled gap around every code span and link; collapsed here rather than there, since the HTML
 * meta descriptions read from it too.
 */
export function docsPageDescription({
    framework,
    pageDescription,
    body,
}: {
    framework: Framework;
    pageDescription?: string;
    body: string;
}): string {
    const description = getPageDescription({ framework, pageDescription: pageDescription ?? '', body });
    return description ? description.replace(/\s+/g, ' ').trim() : '';
}
