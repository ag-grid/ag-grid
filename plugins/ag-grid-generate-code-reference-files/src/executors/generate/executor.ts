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

    const distFolder = workspaceRoot + '/' + options.output;

    // Matches the inputs in generate-doc-references task
    const INTERFACE_GLOBS = [
        ...inputGlob(workspaceRoot + '/packages/ag-grid-community/src'),
        ...inputGlob(workspaceRoot + '/packages/ag-grid-angular/projects/ag-grid-angular/src/lib'),
        ...inputGlob(workspaceRoot + '/packages/ag-grid-react/src/shared'),
        ...inputGlob(workspaceRoot + '/packages/ag-grid-enterprise/src'),
    ];

    const generateMetaFiles = async () => {
        await writeJSONFile(distFolder + '/grid-options.AUTO.json', getGridOptions(gridOpsFile));
        await writeJSONFile(distFolder + '/grid-api.AUTO.json', getGridApi(gridApiFile));
        await writeJSONFile(distFolder + '/row-node.AUTO.json', getRowNode(rowNodeFile));
        await writeJSONFile(distFolder + '/column-options.AUTO.json', getColumnOptions(colDefFile, filterFile));
        await writeJSONFile(
            distFolder + '/column.AUTO.json',
            getColumnTypes(columnFile, ['Column', 'IHeaderColumn', 'IProvidedColumn'])
        );
        await writeJSONFile(
            distFolder + '/columnGroup.AUTO.json',
            getColumnTypes(columnFile, ['ColumnGroup', 'IHeaderColumn'])
        );
        await writeJSONFile(
            distFolder + '/providedColumnGroup.AUTO.json',
            getColumnTypes(columnFile, ['ProvidedColumnGroup', 'IProvidedColumn'])
        );
        await writeJSONFile(distFolder + '/interfaces.AUTO.json', getInterfaces(INTERFACE_GLOBS));
        await writeJSONFile(distFolder + '/doc-interfaces.AUTO.json', buildInterfaceProps(INTERFACE_GLOBS));
    };

    console.log(`--------------------------------------------------------------------------------`);
    console.log(`Generate docs reference files...`);
    console.log('Using Typescript version: ', ts.version);

    await generateMetaFiles();

    console.log(`Generated OK.`);
    console.log(`--------------------------------------------------------------------------------`);
}
