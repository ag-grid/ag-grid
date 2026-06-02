import { inputGlob, writeJSONFile } from 'ag-shared/plugin-utils';
import ts from 'typescript';

import {
    buildInterfaceProps,
    getColumnOptions,
    getColumnTypes,
    getGridApi,
    getGridOptions,
    getInterfaces,
    getRowNode,
    getThemeParams,
} from './generate-code-reference-files';

type ExecutorOptions = { output: string };

export default async function (options: ExecutorOptions) {
    try {
        console.log('-'.repeat(80));
        console.log('Generate docs reference files...');
        console.log('Using Typescript version: ', ts.version);

        await generateFile(options);

        console.log(`Generation completed - written to ${options.output}.`);
        console.log('-'.repeat(80));

        return { success: true };
    } catch (e) {
        console.error(e, { options });
        return { success: false };
    }
}

async function generateFile(options: ExecutorOptions) {
    const workspaceRoot = process.cwd();
    const gridOpsFile = workspaceRoot + '/packages/ag-grid-community/src/entities/gridOptions.ts';
    const colDefFile = workspaceRoot + '/packages/ag-grid-community/src/entities/colDef.ts';
    const filterFile = workspaceRoot + '/packages/ag-grid-community/src/interfaces/iFilter.ts';
    const gridApiFile = workspaceRoot + '/packages/ag-grid-community/src/api/gridApi.ts';
    const columnFile = workspaceRoot + '/packages/ag-grid-community/src/interfaces/iColumn.ts';
    const rowNodeFile = workspaceRoot + '/packages/ag-grid-community/src/interfaces/iRowNode.ts';
    const stackThemesFile = workspaceRoot + '/packages/ag-stack/src/theming/shared/shared-css.ts';
    const themesFile = workspaceRoot + '/packages/ag-grid-community/src/theming/parts/theme/themes.ts';

    const distFolder = workspaceRoot + '/' + options.output;

    // Matches the inputs in generate-doc-references task
    const INTERFACE_GLOBS = [
        ...inputGlob(workspaceRoot + '/packages/ag-stack/src'),
        ...inputGlob(workspaceRoot + '/packages/ag-grid-community/src'),
        ...inputGlob(workspaceRoot + '/packages/ag-grid-angular/projects/ag-grid-angular/src/lib'),
        ...inputGlob(workspaceRoot + '/packages/ag-grid-react/src/shared'),
        ...inputGlob(workspaceRoot + '/packages/ag-grid-enterprise/src'),
    ];

    // Generate all reference data (CPU-bound TS parsing) then write files concurrently.
    const gridOptions = getGridOptions(gridOpsFile);
    const gridApi = getGridApi(gridApiFile);
    const rowNode = getRowNode(rowNodeFile);
    const columnOptions = getColumnOptions(colDefFile, filterFile);
    const column = getColumnTypes(columnFile, ['Column', 'IHeaderColumn', 'IProvidedColumn']);
    const columnGroup = getColumnTypes(columnFile, ['ColumnGroup', 'IHeaderColumn']);
    const providedColumnGroup = getColumnTypes(columnFile, ['ProvidedColumnGroup', 'IProvidedColumn']);
    const interfaces = getInterfaces(INTERFACE_GLOBS);
    const docInterfaces = buildInterfaceProps(INTERFACE_GLOBS);
    const themeParams = getThemeParams(themesFile, stackThemesFile);

    await Promise.all([
        writeJSONFile(distFolder + '/grid-options.AUTO.json', gridOptions),
        writeJSONFile(distFolder + '/grid-api.AUTO.json', gridApi),
        writeJSONFile(distFolder + '/row-node.AUTO.json', rowNode),
        writeJSONFile(distFolder + '/column-options.AUTO.json', columnOptions),
        writeJSONFile(distFolder + '/column.AUTO.json', column),
        writeJSONFile(distFolder + '/columnGroup.AUTO.json', columnGroup),
        writeJSONFile(distFolder + '/providedColumnGroup.AUTO.json', providedColumnGroup),
        writeJSONFile(distFolder + '/interfaces.AUTO.json', interfaces),
        writeJSONFile(distFolder + '/doc-interfaces.AUTO.json', docInterfaces),
        writeJSONFile(distFolder + '/theming-api.AUTO.json', themeParams),
    ]);

    console.log(`Generated OK.`);
    console.log('-'.repeat(80));
}

// Run the executor for degugging
/// node --inspect-brk ./plugins/ag-grid-generate-code-reference-files/dist/src/executors/generate/executor.js
// generateFile({ output: 'TEST' });
