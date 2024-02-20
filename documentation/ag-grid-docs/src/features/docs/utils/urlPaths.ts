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
    importType,
}: {
    internalFramework: InternalFramework;
    pageName: string;
    exampleName: string;
    importType: ImportType;
}) => {
    const exampleUrl = getExampleUrl({
        internalFramework,
        pageName,
        exampleName,
        importType,
    });
    return pathJoin(exampleUrl, 'example-runner');
};

/**
 * Dynamic path for Plunkr examples url
 */
export const getExamplePlunkrUrl = ({
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
    const exampleUrl = getExampleUrl({
        internalFramework,
        pageName,
        exampleName,
        importType,
    });
    return pathJoin(exampleUrl, 'plunkr');
};

/**
 * Dynamic path for Code Sandbox examples url
 */
export const getExampleCodeSandboxUrl = ({
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
    const exampleUrl = getExampleUrl({
        internalFramework,
        pageName,
        exampleName,
        importType,
    });
    return pathJoin(exampleUrl, 'codesandbox');
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
    const exampleUrl = getExampleUrl({
        internalFramework,
        pageName,
        exampleName,
        importType,
    });
    return pathJoin(exampleUrl, 'contents.json');
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
    const exampleUrl = getExampleUrl({
        internalFramework,
        pageName,
        exampleName,
        importType,
    });
    return pathJoin(exampleUrl, fileName);
};

export const getGifStillImageUrl = ({ pageName, imagePath }: { pageName: string; imagePath: string }) => {
    const stillImagePath = imagePath.replace('.gif', '-still.png');
    return pathJoin(SITE_BASE_URL, 'docs', pageName, stillImagePath);
};
