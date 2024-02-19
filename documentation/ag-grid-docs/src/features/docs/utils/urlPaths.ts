import type { ImportType, InternalFramework } from '@ag-grid-types';
import type { Framework } from '@ag-grid-types';
import { SITE_BASE_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';

import { DOCS_FRAMEWORK_PATH_INDEX } from '../constants';

export function getFrameworkFromPath(path: string) {
    return path.split('/')[DOCS_FRAMEWORK_PATH_INDEX];
}

export const getExamplePageUrl = ({ framework, path }: { framework: Framework; path: string }) => {
    return pathJoin(SITE_BASE_URL, framework, path) + '/';
};

/**
 * Dynamic path where examples are
 */
export const getExampleUrl = ({
    internalFramework,
    pageName,
    exampleName,
    importType,
}: {
    internalFramework: InternalFramework;
    pageName: string;
    exampleName: string;
    importType: ImportType;
}) => {
    return pathJoin(SITE_BASE_URL, 'examples', pageName, exampleName, importType, internalFramework);
};

/**
 * Dynamic path where docs example runner examples are
 */
export const getExampleRunnerExampleUrl = ({
    internalFramework,
    pageName,
    exampleName,
}: {
    internalFramework: InternalFramework;
    pageName: string;
    exampleName: string;
}) => {
    return pathJoin(SITE_BASE_URL, internalFramework, pageName, 'examples', exampleName, 'example-runner');
};

/**
 * Dynamic path for Plunkr examples url
 */
export const getExamplePlunkrUrl = ({
    internalFramework,
    pageName,
    exampleName,
}: {
    internalFramework: InternalFramework;
    pageName: string;
    exampleName: string;
}) => {
    return pathJoin(SITE_BASE_URL, internalFramework, pageName, 'examples', exampleName, 'plunkr');
};

/**
 * Dynamic path for Code Sandbox examples url
 */
export const getExampleCodeSandboxUrl = ({
    internalFramework,
    pageName,
    exampleName,
}: {
    internalFramework: InternalFramework;
    pageName: string;
    exampleName: string;
}) => {
    return pathJoin(SITE_BASE_URL, internalFramework, pageName, 'examples', exampleName, 'codesandbox');
};

/**
 * Endpoint for all example files
 */
export const getExampleContentsUrl = ({
    internalFramework,
    pageName,
    exampleName,
    importType,
}: {
    internalFramework: InternalFramework;
    pageName: string;
    exampleName: string;
    importType: ImportType;
}) => {
    return pathJoin(
        getExampleUrl({
            internalFramework,
            pageName,
            exampleName,
            importType,
        }),
        'contents.json'
    );
};

/**
 * Dynamic path where example files are
 */
export const getExampleFileUrl = ({
    internalFramework,
    pageName,
    exampleName,
    importType,
    fileName,
}: {
    internalFramework: InternalFramework;
    pageName: string;
    exampleName: string;
    importType: ImportType;
    fileName: string;
}) => {
    return pathJoin(
        getExampleUrl({
            internalFramework,
            pageName,
            importType,
            exampleName,
        }),
        fileName
    );
};

export const getGifStillImageUrl = ({ pageName, imagePath }: { pageName: string; imagePath: string }) => {
    const stillImagePath = imagePath.replace('.gif', '-still.png');
    return pathJoin(SITE_BASE_URL, 'docs', pageName, stillImagePath);
};
