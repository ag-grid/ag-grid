import {AllEnterpriseModules, AllGridCommunityModules, moduleCombinations} from "./moduleDefinitions";
import {resolve} from "path";
import fs from "fs";

const projectDir = resolve(__dirname, '../angular-package-tests');
const overridesDir = `${projectDir}/overrides`;
const projectBase = `${projectDir}/project.base.json`;

const taskNameEntry = '-- generated-task-names --';
const tasksEntry = '-- generated-tasks --';

const taskTemplate = `
    "test:package:@COMBO_NAME@-latest": {
      "dependsOn": ["^pack"],
      "command": "{projectRoot}/run.sh -o @COMBO_NAME@ -e latest",
      "configurations": {
        "update": {
          "command": "{projectRoot}/run.sh -o @COMBO_NAME@ -u latest"
        }
      }
    }`

const generatedTasks:  { [key: string]: string; } = {};

moduleCombinations.forEach(({modules, expectedSize}) => {
    const moduleName = modules.reduce((acc, m) => (acc.length > 0 ? `${acc}_` : acc) + m!.match(/\p{Lu}/gu)!.join(""), '').toLowerCase();
    const communityModules = modules.filter(m => AllGridCommunityModules.hasOwnProperty(m)).join(', ');
    const enterpriseModules = modules.filter(m => AllEnterpriseModules.hasOwnProperty(m)).join(', ');

    const importsPartial = `
// overridden
import { ModuleRegistry } from 'ag-grid-community';
${communityModules ? "import { " + communityModules + " } from 'ag-grid-community';" : ""}
${enterpriseModules ? "import { " + enterpriseModules + " } from 'ag-grid-enterprise';" : ""}
ModuleRegistry.registerModules([${communityModules}, ${enterpriseModules}]);
`
    fs.mkdirSync(`${overridesDir}/${moduleName}`, { recursive: true });
    fs.writeFileSync(`${overridesDir}/${moduleName}/imports.partial`, importsPartial, { encoding: 'utf-8' });

    generatedTasks[`        "test:package:${moduleName}-latest"`] = taskTemplate.replaceAll('@COMBO_NAME@', moduleName);

})
const baseFile = fs.readFileSync(projectBase, { encoding: 'utf-8' });
const newFile = baseFile.replace(taskNameEntry, Object.keys(generatedTasks).join(',\n'))
    .replace(tasksEntry, Object.values(generatedTasks).join(','));

fs.writeFileSync(`${projectDir}/project.json`, newFile, { encoding: 'utf-8' });

