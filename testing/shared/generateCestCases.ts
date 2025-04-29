import fs from 'fs';
import { resolve } from 'path';

import { AllEnterpriseModules, AllGridCommunityModules, moduleCombinations } from './moduleDefinitions';

const projectDir = resolve(__dirname, '../angular-package-tests');
const overridesDir = `${projectDir}/overrides`;
const projectBase = `${projectDir}/project.base.json`;

const taskNameEntry = '-- generated-task-names --';
const tasksEntry = '-- generated-tasks --';
const shardsEntry = '-- generated-shard-tasks --';

const taskTemplate = `
    "test:package:@COMBO_NAME@-latest": {
      "dependsOn": ["^pack"],
      "command": "{projectRoot}/run.sh -o @COMBO_NAME@ latest",
      "configurations": {
        "update": {
          "command": "{projectRoot}/run.sh -o @COMBO_NAME@ -u latest"
        }
      }
    }`;

const shardTemplate = `
    "test:package:shard-@INDEX@": {
      "executor": "nx:noop",
      "inputs": [],
      "outputs": [],
      "dependsOn": [
@TASKS@
      ],
      "configurations": {
        "update": {}
      }
    }`;

const jobsPerShard = 6;
const generatedTasks: { [key: string]: string } = {};

const ROW_MODELS = [
    'ClientSideRowModelModule',
    'ServerSideRowModelModule',
    'InfiniteRowModelModule',
    'ViewportRowModelModule',
];

function splitIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}

const moduleNames: string[] = [];

function createModuleName(modules: string[]) {
    let name = modules.join('-');
    if (name.length > 80) {
        name = modules
            .reduce((acc, m) => (acc.length > 0 ? `${acc}_` : acc) + m!.match(/\p{Lu}/gu)!.join(''), '')
            .toLowerCase();
    }
    return name;
}

moduleCombinations.forEach(({ modules, expectedSize }) => {
    const moduleName = createModuleName(modules);
    if (moduleNames.includes(moduleName)) {
        // todo deal with this more gracefully
        throw new Error('Duplicate module name: ' + moduleName);
    }
    moduleNames.push(moduleName);

    const communityModules = modules.filter((m) => AllGridCommunityModules.hasOwnProperty(m)).join(', ');
    const enterpriseModules = modules.filter((m) => AllEnterpriseModules.hasOwnProperty(m)).join(', ');

    const hasRowModel = modules.some((m) => ROW_MODELS.includes(m));

    const importsPartial = `
// overridden
import { ModuleRegistry } from 'ag-grid-community';
${!hasRowModel ? "import { ClientSideRowModelModule } from 'ag-grid-community';" : ''}
${communityModules ? 'import { ' + communityModules + " } from 'ag-grid-community';" : ''}
${enterpriseModules ? 'import { ' + enterpriseModules + " } from 'ag-grid-enterprise';" : ''}
ModuleRegistry.registerModules([${!hasRowModel ? 'ClientSideRowModelModule, ' : ''} ${communityModules ? communityModules + ', ' : ''} ${enterpriseModules}]);
`;
    fs.mkdirSync(`${overridesDir}/${moduleName}`, { recursive: true });
    fs.writeFileSync(`${overridesDir}/${moduleName}/imports.partial`, importsPartial, { encoding: 'utf-8' });
    fs.writeFileSync(`${overridesDir}/${moduleName}/expectedSize.json`, JSON.stringify({ expectedSize }, null, 2), {
        encoding: 'utf-8',
    });

    generatedTasks[`        "test:package:${moduleName}-latest"`] = taskTemplate.replaceAll('@COMBO_NAME@', moduleName);
});

const shards: string[] = [];
splitIntoChunks(moduleNames, jobsPerShard).forEach((chunk, index) => {
    shards.push(
        shardTemplate
            .replace('@INDEX@', index.toString())
            .replace('@TASKS@', chunk.map((m) => `        "test:package:${m}-latest"`).join(',\n'))
    );
});

const baseFile = fs.readFileSync(projectBase, { encoding: 'utf-8' });
const newFile = baseFile
    .replace(taskNameEntry, Object.keys(generatedTasks).join(',\n'))
    .replace(tasksEntry, Object.values(generatedTasks).join(','))
    .replace(shardsEntry, shards.join(','));

fs.writeFileSync(`${projectDir}/project.json`, newFile, { encoding: 'utf-8' });
