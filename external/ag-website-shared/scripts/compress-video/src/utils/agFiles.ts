import path from 'path';

import packageJson from '../../../../../../package.json';

type Library = 'charts' | 'grid';

function getLibrary(): Library | undefined {
    if (packageJson.name === 'ag-grid') {
        return 'grid';
    } else if (packageJson.name === 'ag-charts') {
        return 'charts';
    }
}

export function getContentFolder(): string | undefined {
    const rootFolder = '../../../../../../';
    const library = getLibrary();
    let websiteFolder;

    if (library === 'grid') {
        websiteFolder = 'documentation/ag-grid-docs';
    } else if (library === 'charts') {
        websiteFolder = 'packages/ag-charts-website';
    } else {
        return;
    }

    return path.join(__dirname, rootFolder, websiteFolder, 'src/content/docs');
}
