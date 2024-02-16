import prettier from 'prettier';

import { ANGULAR_GENERATED_MAIN_FILE_NAME } from '../constants';
import { vanillaToAngular } from '../transformation-scripts/grid-vanilla-to-angular';
import { vanillaToReactFunctional } from '../transformation-scripts/grid-vanilla-to-react-functional';
import { vanillaToReactFunctionalTs } from '../transformation-scripts/grid-vanilla-to-react-functional-ts';
import { vanillaToTypescript } from '../transformation-scripts/grid-vanilla-to-typescript';
import { vanillaToVue } from '../transformation-scripts/grid-vanilla-to-vue';
import { vanillaToVue3 } from '../transformation-scripts/grid-vanilla-to-vue3';
import { readAsJsFile } from '../transformation-scripts/parser-utils';
import type { InternalFramework } from '../types';
import type { FileContents } from '../types';
import { deepCloneObject } from './deepCloneObject';
import { getBoilerPlateFiles, getEntryFileName, getMainFileName } from './fileUtils';

interface FrameworkFiles {
    files: FileContents;
    boilerPlateFiles?: FileContents;
    hasProvidedExamples?: boolean;
    scriptFiles?: string[];
    /**
     * Filename to execute code
     */
    entryFileName: string;
    /**
     * Filename of main code that is run
     */
    mainFileName: string;
}

type ConfigGenerator = ({
    entryFile,
    indexHtml,
    isEnterprise,
    bindings,
    typedBindings,
    otherScriptFiles,
    ignoreDarkMode,
    isDev,
}: {
    entryFile: string;
    indexHtml: string;
    isEnterprise: boolean;
    bindings: any;
    typedBindings: any;
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
        sourceGenerator: (bindings: any, componentFilenames: string[], allStylesheets: string[]) => (importType) => string;
        internalFramework: InternalFramework;
    }): ConfigGenerator =>
    async ({ bindings, indexHtml, otherScriptFiles, isDev, ignoreDarkMode, importType }) => {
        const boilerPlateFiles = await getBoilerPlateFiles(isDev, internalFramework);

        let mainJs = sourceGenerator(deepCloneObject(bindings), [], [])(importType);

        mainJs = await prettier.format(mainJs, { parser: 'babel' });

        const entryFileName = getEntryFileName(internalFramework)!;
        const mainFileName = getMainFileName(internalFramework)!;

        return {
            files: {
                ...otherScriptFiles,
                [entryFileName]: mainJs,
                'index.html': indexHtml,
            },
            boilerPlateFiles,
            // Other files, not including entry file
            scriptFiles: Object.keys(otherScriptFiles),
            entryFileName,
            mainFileName,
        };
    };

export const frameworkFilesGenerator: Partial<Record<InternalFramework, ConfigGenerator>> = {
    vanilla: async ({ entryFile, indexHtml, typedBindings, otherScriptFiles, ignoreDarkMode }) => {
        const internalFramework: InternalFramework = 'vanilla';
        const entryFileName = getEntryFileName(internalFramework)!;
        const mainFileName = getMainFileName(internalFramework)!;
        let mainJs = readAsJsFile(entryFile);

        // Chart classes that need scoping
        const gridImports = typedBindings.imports.find(
            (i: any) => i.module.includes('ag-grid-community') || i.module.includes('ag-grid-enterprise')
        );
        if (gridImports) {
            gridImports.imports.forEach((i: any) => {
                const toReplace = `(?<!\\.)${i}([\\s/.])`;
                const reg = new RegExp(toReplace, 'g');
                mainJs = mainJs.replace(reg, `agGrid.${i}$1`);
            });
        }

        mainJs = await prettier.format(mainJs, { parser: 'babel' });

        return {
            files: {
                ...otherScriptFiles,
                [entryFileName]: mainJs,
                'index.html': indexHtml,
            },
            scriptFiles: Object.keys(otherScriptFiles).concat(entryFileName),
            entryFileName,
            mainFileName,
        };
    },
    typescript: async ({ entryFile, indexHtml, otherScriptFiles, typedBindings, ignoreDarkMode, isDev, importType }) => {
        const internalFramework: InternalFramework = 'typescript';
        const entryFileName = getEntryFileName(internalFramework)!;
        const mainFileName = getMainFileName(internalFramework)!;

        const boilerPlateFiles = await getBoilerPlateFiles(isDev, internalFramework);

        let mainTs = vanillaToTypescript(deepCloneObject(typedBindings), mainFileName, entryFile)(importType);

        mainTs = await prettier.format(mainTs, { parser: 'typescript' });

        return {
            files: {
                ...otherScriptFiles,
                [entryFileName]: mainTs,
                'index.html': indexHtml,
            },
            boilerPlateFiles,
            // NOTE: `scriptFiles` not required, as system js handles import
            entryFileName,
            mainFileName,
        };
    },
    reactFunctional: async ({ bindings, indexHtml, otherScriptFiles, isDev, ignoreDarkMode, importType }) => {
        const internalFramework = 'reactFunctional';
        const entryFileName = getEntryFileName(internalFramework)!;
        const mainFileName = getMainFileName(internalFramework)!;
        const boilerPlateFiles = await getBoilerPlateFiles(isDev, internalFramework);

        let indexJsx = vanillaToReactFunctional(deepCloneObject(bindings), [], [])(importType);

        indexJsx = await prettier.format(indexJsx, { parser: 'babel' });

        return {
            files: {
                ...otherScriptFiles,
                [entryFileName]: indexJsx,
                'index.html': indexHtml,
            },
            boilerPlateFiles,
            // Other files, not including entry file
            scriptFiles: Object.keys(otherScriptFiles),
            entryFileName,
            mainFileName,
        };
    },
    reactFunctionalTs: async ({ typedBindings, indexHtml, otherScriptFiles, ignoreDarkMode, isDev, importType }) => {
        const internalFramework: InternalFramework = 'reactFunctionalTs';
        const entryFileName = getEntryFileName(internalFramework)!;
        const mainFileName = getMainFileName(internalFramework)!;
        const boilerPlateFiles = await getBoilerPlateFiles(isDev, internalFramework);

        let indexTsx = vanillaToReactFunctionalTs(deepCloneObject(typedBindings), [], [])(importType);

        indexTsx = await prettier.format(indexTsx, { parser: 'typescript' });

        return {
            files: {
                ...otherScriptFiles,
                [entryFileName]: indexTsx,
                'index.html': indexHtml,
            },
            boilerPlateFiles,
            // NOTE: `scriptFiles` not required, as system js handles import
            entryFileName,
            mainFileName,
        };
    },
    angular: async ({ typedBindings, otherScriptFiles, isDev, ignoreDarkMode, importType }) => {
        const internalFramework: InternalFramework = 'angular';
        const entryFileName = getEntryFileName(internalFramework)!;
        const mainFileName = getMainFileName(internalFramework)!;
        const boilerPlateFiles = await getBoilerPlateFiles(isDev, internalFramework);

        let appComponent = vanillaToAngular(deepCloneObject(typedBindings), [],[])(importType);

        appComponent = await prettier.format(appComponent, { parser: 'typescript' });

        return {
            files: {
                ...otherScriptFiles,
                // NOTE: No `index.html` as the contents are generated in the `app.component` file
                // NOTE: Duplicating entrypoint boilerplate file here, so examples
                // load from the same directory as these files, rather than
                // boilerplate files
                [entryFileName]: boilerPlateFiles[entryFileName],
                [ANGULAR_GENERATED_MAIN_FILE_NAME]: appComponent,
            },
            boilerPlateFiles,
            entryFileName,
            mainFileName,
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
