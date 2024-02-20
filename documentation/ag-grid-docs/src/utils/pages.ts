import type { InternalFramework, Library } from '@ag-grid-types';
import { SITE_BASE_URL, USE_PUBLISHED_PACKAGES } from '@constants';
import type { CollectionEntry } from 'astro:content';
import glob from 'glob';

import { type GlobConfig, createFilePathFinder } from './createFilePathFinder';
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

export interface DevFileRoute {
    params: {
        filePath: string;
    };
    props: {
        fullFilePath: string;
    };
}

/**
 * Mapping for dev files, from route to file path
 *
 * NOTE: File path is after `getRootUrl()`
 */
export const DEV_FILE_PATH_MAP: Record<string, string | GlobConfig> = {
    // TODO: Fix hardcoded module files
    // NOTE: Using `*.esm.mjs` and not `.cjs.js` as those are the module files

    // Community modules
    '@ag-grid-community/core/dist/cjs/es5/main.js': 'community-modules/core/dist/package/main.esm.mjs',
    '@ag-grid-community/client-side-row-model/dist/cjs/es5/main.js':
        'community-modules/client-side-row-model/dist/package/main.esm.mjs',
    '@ag-grid-community/csv-export/dist/cjs/es5/main.js': 'community-modules/csv-export/dist/package/main.esm.mjs',
    '@ag-grid-community/infinite-row-model/dist/cjs/es5/main.js':
        'community-modules/infinite-row-model/dist/package/main.esm.mjs',

    // Enterprise modules
    '@ag-grid-enterprise/advanced-filter': 'enterprise-modules/advanced-filter/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/all-modules': 'enterprise-modules/all-modules/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/charts': 'enterprise-modules/charts/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/charts-enterprise': 'enterprise-modules/charts-enterprise/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/clipboard': 'enterprise-modules/clipboard/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/column-tool-panel': 'enterprise-modules/column-tool-panel/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/core': 'enterprise-modules/core/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/excel-export': 'enterprise-modules/excel-export/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/filter-tool-panel': 'enterprise-modules/filter-tool-panel/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/master-detail': 'enterprise-modules/master-detail/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/menu': 'enterprise-modules/menu/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/multi-filter': 'enterprise-modules/multi-filter/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/range-selection': 'enterprise-modules/range-selection/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/rich-select': 'enterprise-modules/rich-select/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/row-grouping': 'enterprise-modules/row-grouping/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/server-side-row-model': 'enterprise-modules/server-side-row-model/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/set-filter': 'enterprise-modules/set-filter/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/side-bar': 'enterprise-modules/side-bar/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/sparklines': 'enterprise-modules/sparklines/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/status-bar': 'enterprise-modules/status-bar/dist/package/main.esm.mjs',
    '@ag-grid-enterprise/viewport-row-model': 'enterprise-modules/viewport-row-model/dist/package/main.esm.mjs',

    // Styles
    '@ag-grid-community/styles/ag-grid.css': 'community-modules/styles/ag-grid.css',
    '@ag-grid-community/styles/ag-theme-quartz.css': 'community-modules/styles/ag-theme-quartz.css',

    // TODO: Dynamically map files
    // '@ag-grid-community': {
    //     sourceFolder: 'community-modules',
    //     fileNameGlob: '*/dist/**/*.{cjs,js,map}',
    // },
    // '@ag-grid-enterprise': {
    //     sourceFolder: 'enterprise-modules',
    //     fileNameGlob: '*/dist/**/*.{cjs,js,map}',
    // },
};

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
    return new URL(`${root}/dist/generated-examples/ag-grid-docs/`, import.meta.url);
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

export const isUsingPublishedPackages = () => USE_PUBLISHED_PACKAGES === true;
export const isPreProductionBuild = () => false;
export const isBuildServerBuild = () => false;

export function getDevFiles(): DevFileRoute[] {
    const result = [];

    for (const [filePath, sourceFilePath] of Object.entries(DEV_FILE_PATH_MAP)) {
        if (typeof sourceFilePath === 'string') {
            const fullFilePath = pathJoin(getRootUrl().pathname, sourceFilePath);
            if (fullFilePath.includes('**')) {
                const pathPrefix = filePath.substring(0, filePath.indexOf('**'));
                const sourcePrefix = fullFilePath.substring(0, fullFilePath.indexOf('**'));

                const matches = glob.sync(fullFilePath);
                if (matches.length === 0) {
                    throw new Error(`No files match the glob ${fullFilePath}`);
                }

                for (const globFile of matches) {
                    const relativeFile = globFile.replace(sourcePrefix, '');

                    result.push({
                        params: { filePath: `${pathPrefix}${relativeFile}` },
                        props: { fullFilePath: globFile },
                    });
                }
                continue;
            }

            result.push({ params: { filePath }, props: { fullFilePath } });
        } else if (typeof sourceFilePath === 'object') {
            const { globPattern, getFilePath } = createFilePathFinder({
                baseUrl: getRootUrl().pathname,
                globConfig: sourceFilePath as GlobConfig,
            });

            const matches = glob.sync(globPattern);
            if (matches.length === 0) {
                throw new Error(`No files match the glob ${globPattern} for config ${JSON.stringify(sourceFilePath)}`);
            }

            for (const globFile of matches) {
                const filePath = getFilePath(globFile);

                result.push({
                    params: { filePath },
                    props: { fullFilePath: globFile },
                });
            }
        }
    }

    return result;
}

/**
 * Get url of example boiler plate files
 */
export const getBoilerPlateUrl = ({
    library,
    internalFramework,
}: {
    library: Library;
    internalFramework: InternalFramework;
}) => {
    let boilerPlateFramework;
    switch (internalFramework) {
        case 'reactFunctional':
            boilerPlateFramework = 'react';
            break;
        case 'reactFunctionalTs':
            boilerPlateFramework = 'react-ts';
            break;
        default:
            boilerPlateFramework = internalFramework;
            break;
    }

    const boilerplatePath = pathJoin(
        SITE_BASE_URL,
        '/example-runner',
        `${library}-${boilerPlateFramework}-boilerplate`
    );

    return boilerplatePath;
};
