export interface AppDefinition {
    /** The modules the app registers, split by the package that exports them. */
    community: string[];
    enterprise: string[];
}

/**
 * A cross-section rather than every module: one app per place a regression can show up.
 * - nothing registered: the baseline every other app is measured against
 * - one community module: community code that is always bundled
 * - one enterprise module: enterprise code that is bundled whenever any enterprise module is used
 * - everything: the largest realistic bundle
 */
export const APPS: AppDefinition[] = [
    { community: [], enterprise: [] },
    { community: ['ClientSideRowModelModule'], enterprise: [] },
    { community: [], enterprise: ['StatusBarModule'] },
    { community: [], enterprise: ['AllEnterpriseModule'] },
];

export function appName({ community, enterprise }: AppDefinition): string[] {
    return [...community, ...enterprise];
}

export function appSource({ community, enterprise }: AppDefinition): string {
    return [
        `import { createRoot } from 'react-dom/client';`,
        `import { ModuleRegistry${community.map((module) => `, ${module}`).join('')} } from 'ag-grid-community';`,
        enterprise.length > 0 ? `import { ${enterprise.join(', ')} } from 'ag-grid-enterprise';` : '',
        `import { AgGridReact } from 'ag-grid-react';`,
        ``,
        `ModuleRegistry.registerModules([${[...community, ...enterprise].join(', ')}]);`,
        ``,
        `createRoot(document.getElementById('root')!).render(<AgGridReact rowData={[]} columnDefs={[{ field: 'a' }]} />);`,
        ``,
    ].join('\n');
}
