 
import ts from 'typescript';

import { inputGlob, writeJSONFile } from '../../executors-utils';
import { getGridOptions, getInterfaces } from './generate-code-reference-files';
import { getGridApi } from './generate-code-reference-files';
import { getRowNode } from './generate-code-reference-files';
import { getColumnOptions } from './generate-code-reference-files';
import { getColumn } from './generate-code-reference-files';
import { buildInterfaceProps } from './generate-code-reference-files';

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
    const gridOpsFile = workspaceRoot + '/community-modules/core/src/entities/gridOptions.ts';
    const colDefFile = workspaceRoot + '/community-modules/core/src/entities/colDef.ts';
    const filterFile = workspaceRoot + '/community-modules/core/src/interfaces/iFilter.ts';
    const gridApiFile = workspaceRoot + '/community-modules/core/src/gridApi.ts';
    const columnFile = workspaceRoot + '/community-modules/core/src/entities/column.ts';
    const rowNodeFile = workspaceRoot + '/community-modules/core/src/interfaces/iRowNode.ts';

    const distFolder = workspaceRoot + '/' + options.output;

    // Matches the inputs in generate-doc-references task
    const INTERFACE_GLOBS = [
        ...inputGlob(workspaceRoot + '/community-modules/core/src'),
        ...inputGlob(workspaceRoot + '/community-modules/angular/projects/ag-grid-angular/src/lib'),
        ...inputGlob(workspaceRoot + '/community-modules/react/src/shared'),
        ...inputGlob(workspaceRoot + '/grid-enterprise-modules/set-filter/src'),
        ...inputGlob(workspaceRoot + '/grid-enterprise-modules/filter-tool-panel/src'),
        ...inputGlob(workspaceRoot + '/grid-enterprise-modules/multi-filter/src'),
    ];

    const generateMetaFiles = async () => {
        await writeJSONFile(distFolder + '/grid-options.AUTO.json', getGridOptions(gridOpsFile));
        await writeJSONFile(distFolder + '/grid-api.AUTO.json', getGridApi(gridApiFile));
        await writeJSONFile(distFolder + '/row-node.AUTO.json', getRowNode(rowNodeFile));
        await writeJSONFile(distFolder + '/column-options.AUTO.json', getColumnOptions(colDefFile, filterFile));
        await writeJSONFile(distFolder + '/column.AUTO.json', getColumn(columnFile));
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
