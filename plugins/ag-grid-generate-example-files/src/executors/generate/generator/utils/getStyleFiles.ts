import fs from 'fs';

import { getFileList } from './fileUtils';

// Relative to the repo root, which is the executor's working directory
const EXAMPLE_CONTROLS_STYLES_PATH =
    './external/ag-website-shared/src/components/example-runner/styles/example-controls.css';
const EXAMPLE_STYLE_FILE_NAME = 'ag-example-styles.css';

/**
 * The shared controls sheet is commented for its maintainers, but users see the generated copy in
 * the example code, so the comments are removed from it.
 */
export const stripCssComments = (css: string) =>
    css
        .replace(/^[ \t]*\/\*[\s\S]*?\*\/[ \t]*\n/gm, '')
        .replace(/[ \t]*\/\*[\s\S]*?\*\//g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trimStart();

export const getStyleFiles = async ({
    folderPath,
    sourceFileList,
}: {
    folderPath: string;
    sourceFileList: string[];
}) => {
    const exampleControlsStyles = stripCssComments(fs.readFileSync(EXAMPLE_CONTROLS_STYLES_PATH, 'utf-8'));
    const styleFiles = sourceFileList.filter((fileName) => fileName.endsWith('.css'));

    const styleContents = await getFileList({
        folderPath,
        fileList: styleFiles,
    });

    return { [EXAMPLE_STYLE_FILE_NAME]: exampleControlsStyles, ...styleContents };
};
