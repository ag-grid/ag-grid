import type { CollectionEntry } from 'astro:content';

import { getIsDev } from './env';
import { pathJoin } from './pathJoin';

export type DocsPage =
    | CollectionEntry<'docs'>
    | {
          slug: string;
      };

export interface InternalFrameworkExample {
    internalFramework: InternalFramework;
    pageName: string;
    exampleName: string;
}

/**
 * The root url where the monorepo exists
 */
export const getRootUrl = (): URL => {
    const root = getIsDev()
        ? // Relative to the folder of this file
          '../../../../'
        : // TODO: Relative to `/dist/chunks/pages` folder (Nx specific)
          '../../../../../';
    return new URL(root, import.meta.url);
};

/**
 *  TODO: Figure this out when working on build
 */
export const getExampleRootFileUrl = (): URL => {
    const root = getRootUrl().pathname;
    return new URL(`${root}/dist/generated-examples/ag-grid-website/`, import.meta.url);
};

/**
 * The `ag-charts-website` root url where the monorepo exists
 */
const getWebsiteRootUrl = ({ isDev = getIsDev() }: { isDev?: boolean } = { isDev: getIsDev() }): URL => {
    const root = isDev
        ? // Relative to the folder of this file
          '../../'
        : // Relative to `/dist/chunks/pages` folder (Nx specific)
          '../../../';
    return new URL(root, import.meta.url);
};

export const getContentRootFileUrl = ({ isDev }: { isDev?: boolean } = {}): URL => {
    const websiteRoot = getWebsiteRootUrl({ isDev });
    const contentRoot = pathJoin(websiteRoot, 'src/content');
    return new URL(contentRoot, import.meta.url);
};
