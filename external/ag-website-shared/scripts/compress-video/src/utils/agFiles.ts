import path from 'path';

import packageJson from '../../../../../../package.json';

type Library = 'charts' | 'grid' | 'studio';

function getLibrary(): Library | undefined {
    if (packageJson.name === 'ag-grid') {
        return 'grid';
    } else if (packageJson.name === 'ag-charts') {
        return 'charts';
    } else if (packageJson.name === 'ag-studio') {
        return 'studio';
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
    } else if (library === 'studio') {
        websiteFolder = 'packages/ag-studio-docs';
    } else {
        return;
    }

    return path.join(__dirname, rootFolder, websiteFolder, 'src/content/docs');
}
