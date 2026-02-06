import path from 'path';

import packageJson from '../../../../../../package.json';

type Library = 'charts' | 'grid' | 'dash';

function getLibrary(): Library | undefined {
    if (packageJson.name === 'ag-grid') {
        return 'grid';
    } else if (packageJson.name === 'ag-charts') {
        return 'charts';
    } else if (packageJson.name === 'ag-dash') {
        return 'dash';
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
    } else if (library === 'dash') {
        websiteFolder = 'packages/ag-dash-docs';
    } else {
        return;
    }

    return path.join(__dirname, rootFolder, websiteFolder, 'src/content/docs');
}
