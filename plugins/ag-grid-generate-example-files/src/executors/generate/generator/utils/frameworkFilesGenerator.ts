import prettier from 'prettier';

import { ANGULAR_GENERATED_MAIN_FILE_NAME } from '../constants';
import { vanillaToAngular } from '../transformation-scripts/grid-vanilla-to-angular';
import { vanillaToReactFunctional } from '../transformation-scripts/grid-vanilla-to-react-functional';
import { vanillaToReactFunctionalTs } from '../transformation-scripts/grid-vanilla-to-react-functional-ts';
import { vanillaToTypescript } from '../transformation-scripts/grid-vanilla-to-typescript';
import { vanillaToVue } from '../transformation-scripts/grid-vanilla-to-vue';
import { vanillaToVue3 } from '../transformation-scripts/grid-vanilla-to-vue3';
import { getIntegratedDarkModeCode, readAsJsFile } from '../transformation-scripts/parser-utils';
import { FRAMEWORKS, InternalFramework } from '../types';
import type { FileContents } from '../types';
import { deepCloneObject } from './deepCloneObject';
import { getBoilerPlateFiles, getEntryFileName, getMainFileName } from './fileUtils';
import { basename } from 'path';

interface FrameworkFiles {
    files: FileContents;
    hasProvidedExamples?: boolean;
    scriptFiles?: string[];
}

type ConfigGenerator = ({
    entryFile,
    indexHtml,
    isEnterprise,
    bindings,
    typedBindings,
    componentScriptFiles,
    otherScriptFiles,
    ignoreDarkMode,
    isDev,
}: {
    entryFile: string;
    indexHtml: string;
    isEnterprise: boolean;
    bindings: any;
    typedBindings: any;
    componentScriptFiles: FileContents;
    otherScriptFiles: FileContents;
    ignoreDarkMode?: boolean;
    isDev: boolean;
    importType: 'modules' | 'packages';
}) => Promise<FrameworkFiles>;

const createVueFilesGenerator =
    ({
        sourceGenerator,
        internalFramework,
    }: {
        sourceGenerator: (
            bindings: any,
            componentFilenames: string[],
            allStylesheets: string[]
        ) => (importType) => string;
        internalFramework: InternalFramework;
    }): ConfigGenerator =>
    async ({ bindings, indexHtml, componentScriptFiles, otherScriptFiles, isDev, importType }) => {
        const componentNames = getComponentName(componentScriptFiles);
        let mainJs = sourceGenerator(deepCloneObject(bindings), componentNames, [])(importType);

        mainJs = await prettier.format(mainJs, { parser: 'babel' });

        const entryFileName = getEntryFileName(internalFramework)!;

        const scriptFiles = {...otherScriptFiles, ...componentScriptFiles};

        return {
            files: {
                ...scriptFiles,
                [entryFileName]: mainJs,
                'index.html': indexHtml,
            },
            // Other files, not including entry file
            scriptFiles: Object.keys(scriptFiles),
        };
    };

export const frameworkFilesGenerator: Partial<Record<InternalFramework, ConfigGenerator>> = {
    vanilla: async ({ entryFile, indexHtml, typedBindings, componentScriptFiles, otherScriptFiles, ignoreDarkMode }) => {
        const internalFramework: InternalFramework = 'vanilla';
        const entryFileName = getEntryFileName(internalFramework)!;
        let mainJs = readAsJsFile(entryFile);

        // replace Typescript createGrid( with Javascript agGrid.createGrid(
        mainJs = mainJs.replace(/createGrid\(/g, 'agGrid.createGrid(');

        // replace Typescript LicenseManager.setLicenseKey( with Javascript agGrid.LicenseManager.setLicenseKey(
        mainJs = mainJs.replace(/LicenseManager\.setLicenseKey\(/g, "agGrid.LicenseManager.setLicenseKey(");

        mainJs = mainJs.replace(/agGrid\.createGrid(.*);/g, `agGrid.createGrid$1; ${getIntegratedDarkModeCode(entryFile, false, 'gridApi')}`);

        const scriptFiles = {...otherScriptFiles, ...componentScriptFiles};
        mainJs = await prettier.format(mainJs, { parser: 'babel' });

        return {
            files: {
                ...scriptFiles,
                [entryFileName]: mainJs,
                'index.html': indexHtml,
            },
            scriptFiles: Object.keys(scriptFiles).concat(entryFileName),
        };
    },
    typescript: async ({
        entryFile,
        indexHtml,
        otherScriptFiles,
        componentScriptFiles,
        typedBindings,
        isDev,
        importType,
    }) => {
        const internalFramework: InternalFramework = 'typescript';
        const entryFileName = getEntryFileName(internalFramework)!;
        const mainFileName = getMainFileName(internalFramework)!;

        let mainTs = vanillaToTypescript(deepCloneObject(typedBindings), mainFileName, entryFile)(importType);

        mainTs = await prettier.format(mainTs, { parser: 'typescript' });

        const scriptFiles = {...otherScriptFiles, ...componentScriptFiles};

        return {
            files: {
                ...scriptFiles,
                [entryFileName]: mainTs,
                'index.html': indexHtml,
            },
            // NOTE: `scriptFiles` not required, as system js handles import
        };
    },
    reactFunctional: async ({ bindings, indexHtml, otherScriptFiles, componentScriptFiles, isDev, importType }) => {
        const internalFramework = 'reactFunctional';
        const entryFileName = getEntryFileName(internalFramework)!;

        const componentNames = getComponentName(componentScriptFiles);
        let indexJsx = vanillaToReactFunctional(deepCloneObject(bindings), componentNames, [])(importType);

        indexJsx = await prettier.format(indexJsx, { parser: 'babel' });

        const scriptFiles = {...otherScriptFiles, ...componentScriptFiles};

        return {
            files: {
                ...scriptFiles,
                [entryFileName]: indexJsx,
                'index.html': indexHtml,
            },
            // Other files, not including entry file
            scriptFiles: Object.keys(scriptFiles),
        };
    },
    reactFunctionalTs: async ({ typedBindings, indexHtml, otherScriptFiles, componentScriptFiles, isDev, importType }) => {
        const internalFramework: InternalFramework = 'reactFunctionalTs';
        const entryFileName = getEntryFileName(internalFramework)!;
        const componentNames = getComponentName(componentScriptFiles);
        let indexTsx = vanillaToReactFunctionalTs(deepCloneObject(typedBindings), componentNames, [])(importType);

        indexTsx = await prettier.format(indexTsx, { parser: 'typescript' });

        const scriptFiles = {...otherScriptFiles, ...componentScriptFiles};

        return {
            files: {
                ...scriptFiles,
                [entryFileName]: indexTsx,
                'index.html': indexHtml,
            },
            // NOTE: `scriptFiles` not required, as system js handles import
        };
    },
    angular: async ({ typedBindings, otherScriptFiles, componentScriptFiles, isDev, importType }) => {
        const internalFramework: InternalFramework = 'angular';
        const entryFileName = getEntryFileName(internalFramework)!;
        const boilerPlateFiles = await getBoilerPlateFiles(isDev, internalFramework);

        const componentNames = getComponentName(componentScriptFiles);
        let appComponent = vanillaToAngular(deepCloneObject(typedBindings), componentNames, [])(importType);

        appComponent = await prettier.format(appComponent, { parser: 'typescript' });

        const scriptFiles = {...otherScriptFiles, ...componentScriptFiles};

        return {
            files: {
                ...scriptFiles,
                // NOTE: No `index.html` as the contents are generated in the `app.component` file
                // NOTE: Duplicating entrypoint boilerplate file here, so examples
                // load from the same directory as these files, rather than
                // boilerplate files
                [entryFileName]: boilerPlateFiles[entryFileName],
                [ANGULAR_GENERATED_MAIN_FILE_NAME]: appComponent,
            },
        };
    },
    vue: createVueFilesGenerator({
        sourceGenerator: vanillaToVue,
        internalFramework: 'vue',
    }),
    vue3: createVueFilesGenerator({
        sourceGenerator: vanillaToVue3,
        internalFramework: 'vue3',
    }),
};

function getComponentName(otherScriptFiles: FileContents) {
    return Object.keys(otherScriptFiles).map((file) => basename(file));
}
