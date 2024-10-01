import { basename } from 'path';
import prettier from 'prettier';

import { ANGULAR_GENERATED_MAIN_FILE_NAME } from '../constants';
import { vanillaToAngular } from '../transformation-scripts/grid-vanilla-to-angular';
import { vanillaToReactFunctional } from '../transformation-scripts/grid-vanilla-to-react-functional';
import { vanillaToReactFunctionalTs } from '../transformation-scripts/grid-vanilla-to-react-functional-ts';
import { vanillaToTypescript } from '../transformation-scripts/grid-vanilla-to-typescript';
import { vanillaToVue3 } from '../transformation-scripts/grid-vanilla-to-vue3';
import {
    getIntegratedDarkModeCode,
    readAsJsFile,
    removeModuleRegistration,
} from '../transformation-scripts/parser-utils';
import type { InternalFramework, ParsedBindings } from '../types';
import type { ExampleConfig, FileContents } from '../types';
import { deepCloneObject } from './deepCloneObject';
import { getBoilerPlateFiles, getEntryFileName, getMainFileName } from './fileUtils';

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
    styleFiles,
    ignoreDarkMode,
    isDev,
    exampleConfig,
}: {
    entryFile: string;
    indexHtml: string;
    isEnterprise: boolean;
    bindings: ParsedBindings;
    typedBindings: ParsedBindings;
    componentScriptFiles: FileContents;
    otherScriptFiles: FileContents;
    styleFiles: FileContents;
    ignoreDarkMode?: boolean;
    isDev: boolean;
    exampleConfig: ExampleConfig;
    importType: 'modules' | 'packages';
}) => Promise<FrameworkFiles>;

const createVueFilesGenerator =
    ({
        sourceGenerator,
        internalFramework,
    }: {
        sourceGenerator: (
            bindings: ParsedBindings,
            exampleConfig: ExampleConfig,
            componentFilenames: string[],
            allStylesheets: string[]
        ) => (importType) => string;
        internalFramework: InternalFramework;
    }): ConfigGenerator =>
    async ({
        bindings,
        indexHtml,
        componentScriptFiles,
        otherScriptFiles,
        styleFiles,
        isDev,
        importType,
        exampleConfig,
    }) => {
        const componentNames = getComponentName(componentScriptFiles);
        let mainJs = sourceGenerator(
            deepCloneObject(bindings),
            exampleConfig,
            componentNames,
            Object.keys(styleFiles)
        )(importType);

        if (!isDev) {
            mainJs = await prettier.format(mainJs, { parser: 'babel' });
        }

        const entryFileName = getEntryFileName(internalFramework)!;

        const scriptFiles = { ...otherScriptFiles, ...componentScriptFiles };

        return {
            files: {
                ...scriptFiles,
                [entryFileName]: mainJs,
                'index.html': indexHtml,
            },
            // NOTE: `scriptFiles` not required, as system js handles import
        };
    };

export const frameworkFilesGenerator: Partial<Record<InternalFramework, ConfigGenerator>> = {
    vanilla: async ({ bindings, entryFile, indexHtml, componentScriptFiles, otherScriptFiles, isDev }) => {
        const internalFramework: InternalFramework = 'vanilla';
        const entryFileName = getEntryFileName(internalFramework)!;
        let mainJs = readAsJsFile(entryFile, 'vanilla');

        // Variables imported from ag grid packages to convert to agGrid.<variable> syntax
        const convertedImportNames = [
            'createGrid',
            'LicenseManager.setLicenseKey',
            'themeQuartz',
            'themeAlpine',
            'themeBalham',
            'createTheme',
            'createPart',
            'colorSchemeLight',
            'colorSchemeLightCold',
            'colorSchemeLightWarm',
            'colorSchemeDark',
            'colorSchemeDarkBlue',
            'colorSchemeDarkWarm',
            'iconSetQuartz',
            'iconSetQuartzLight',
            'iconSetQuartzBold',
            'iconSetQuartzRegular',
            'iconSetAlpine',
            'iconSetMaterial',
            'checkboxStyleDefault',
            'inputStyleBase',
            'inputStyleBordered',
            'inputStyleUnderlined',
            'tabStyleBase',
            'tabStyleQuartz',
            'tabStyleMaterial',
            'tabStyleAlpine',
            'tabStyleRolodex',
            // ...(bindings.imports.find((i) => i.module.includes('@ag-grid-community/theming'))?.imports || []),
        ];

        const importNamePattern = '\\b(' + convertedImportNames.map(regExpEscape).join('|') + ')\\b';
        mainJs = mainJs.replace(new RegExp(importNamePattern, 'g'), 'agGrid.$&');

        // Javascript is packages only
        mainJs = removeModuleRegistration(mainJs);

        const integratedDarkModeCode = getIntegratedDarkModeCode(bindings.exampleName, false, 'gridApi');
        mainJs = mainJs.replace(/agGrid\.createGrid(.*);/g, `agGrid.createGrid$1; ${integratedDarkModeCode}`);

        // remove any leading new lines
        mainJs = mainJs.replace(/^\s*[\r\n]/, '');

        const scriptFiles = { ...otherScriptFiles, ...componentScriptFiles };
        if (!isDev) {
            mainJs = await prettier.format(mainJs, { parser: 'babel' });
        }

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
        exampleConfig,
    }) => {
        const internalFramework: InternalFramework = 'typescript';
        const entryFileName = getEntryFileName(internalFramework)!;
        const mainFileName = getMainFileName(internalFramework)!;

        let mainTs = vanillaToTypescript(
            deepCloneObject(typedBindings),
            exampleConfig,
            mainFileName,
            entryFile
        )(importType);

        if (!isDev) {
            mainTs = await prettier.format(mainTs, { parser: 'typescript' });
        }

        const scriptFiles = { ...otherScriptFiles, ...componentScriptFiles };

        return {
            files: {
                ...scriptFiles,
                [entryFileName]: mainTs,
                'index.html': indexHtml,
            },
            // NOTE: `scriptFiles` not required, as system js handles import
        };
    },
    reactFunctional: async ({
        bindings,
        indexHtml,
        otherScriptFiles,
        componentScriptFiles,
        styleFiles,
        isDev,
        importType,
        exampleConfig,
    }) => {
        const internalFramework = 'reactFunctional';
        const entryFileName = getEntryFileName(internalFramework)!;

        const componentNames = getComponentName(componentScriptFiles);
        let indexJsx = vanillaToReactFunctional(
            deepCloneObject(bindings),
            exampleConfig,
            componentNames,
            Object.keys(styleFiles)
        )(importType);

        if (!isDev) {
            indexJsx = await prettier.format(indexJsx, { parser: 'babel' });
        }

        return {
            files: {
                ...otherScriptFiles,
                ...componentScriptFiles,
                [entryFileName]: indexJsx,
                'index.html': indexHtml,
            },
            // NOTE: `scriptFiles` not required, as system js handles import
        };
    },
    reactFunctionalTs: async ({
        typedBindings,
        indexHtml,
        otherScriptFiles,
        componentScriptFiles,
        styleFiles,
        isDev,
        importType,
        exampleConfig,
    }) => {
        const internalFramework: InternalFramework = 'reactFunctionalTs';
        const entryFileName = getEntryFileName(internalFramework)!;
        const componentNames = getComponentName(componentScriptFiles);
        let indexTsx = vanillaToReactFunctionalTs(
            deepCloneObject(typedBindings),
            exampleConfig,
            componentNames,
            Object.keys(styleFiles)
        )(importType);

        if (!isDev) {
            indexTsx = await prettier.format(indexTsx, { parser: 'typescript' });
        }

        return {
            files: {
                ...otherScriptFiles,
                ...componentScriptFiles,
                [entryFileName]: indexTsx,
                'index.html': indexHtml,
            },
            // NOTE: `scriptFiles` not required, as system js handles import
        };
    },
    angular: async ({
        typedBindings,
        otherScriptFiles,
        componentScriptFiles,
        styleFiles,
        isDev,
        importType,
        exampleConfig,
    }) => {
        const internalFramework: InternalFramework = 'angular';
        const entryFileName = getEntryFileName(internalFramework)!;
        const boilerPlateFiles = await getBoilerPlateFiles(isDev, internalFramework);

        const componentNames = getComponentName(componentScriptFiles);
        let appComponent = vanillaToAngular(
            deepCloneObject(typedBindings),
            exampleConfig,
            componentNames,
            Object.keys(styleFiles)
        )(importType);

        if (!isDev) {
            appComponent = await prettier.format(appComponent, { parser: 'typescript' });
        }

        return {
            files: {
                ...otherScriptFiles,
                ...componentScriptFiles,
                // NOTE: No `index.html` as the contents are generated in the `app.component` file
                // NOTE: Duplicating entrypoint boilerplate file here, so examples
                // load from the same directory as these files, rather than
                // boilerplate files
                [entryFileName]: boilerPlateFiles[entryFileName],
                [ANGULAR_GENERATED_MAIN_FILE_NAME]: appComponent,
            },
        };
    },
    vue3: createVueFilesGenerator({
        sourceGenerator: vanillaToVue3,
        internalFramework: 'vue3',
    }),
};

function getComponentName(otherScriptFiles: FileContents) {
    return Object.keys(otherScriptFiles).map((file) => basename(file));
}

function regExpEscape(input: string) {
    return input.replace(/[-[\]{}()*+!<=:?./\\^$|#\s,]/g, '\\$&');
}
