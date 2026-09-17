import fs from 'fs';

import { getFileList } from './fileUtils';

// Relative to the repo root, which is the executor's working directory
const EXAMPLE_CONTROLS_STYLES_PATH =
    './external/ag-website-shared/src/components/example-runner/styles/example-controls.css';
const EXAMPLE_STYLE_FILE_NAME = 'ag-example-styles.css';

export const getStyleFiles = async ({
    folderPath,
    sourceFileList,
}: {
    folderPath: string;
    sourceFileList: string[];
}) => {
    const exampleControlsStyles = fs.readFileSync(EXAMPLE_CONTROLS_STYLES_PATH, 'utf-8');
    const styleFiles = sourceFileList.filter((fileName) => fileName.endsWith('.css'));

    const styleContents = await getFileList({
        folderPath,
        fileList: styleFiles,
    });

    return { [EXAMPLE_STYLE_FILE_NAME]: exampleControlsStyles, ...styleContents };
};
