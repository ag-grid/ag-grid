import type { FileContents } from '@components/example-generator/types';
import { stripOutExampleGeneratorCode } from '@components/example-runner/components/stripOutExampleGeneratorCode';

import { isSpecFile, isTransformableModule, toModuleFileName, transformExampleModule } from './transformExampleModule';

/**
 * The example's files with every TypeScript source replaced by the transpiled module the
 * browser actually loads.
 *
 * Exported examples (Plunker, and the static CodeSandbox templates) have no build step, so
 * they ship these rather than the TypeScript sources. Templates with a real toolchain --
 * currently the React CodeSandbox ones -- keep the original sources and compile them
 * themselves.
 */
export const getModuleFiles = (files: FileContents): FileContents => {
    const moduleFiles: FileContents = {};

    // The generator's harness code has to go before transpiling: its `/** ... **/` markers
    // are dropped by the transpiler, so there is nothing to match on in the output
    const sources = { ...files };
    stripOutExampleGeneratorCode(sources);

    for (const [fileName, source] of Object.entries(sources)) {
        if (isSpecFile(fileName)) {
            continue;
        }

        if (isTransformableModule(fileName)) {
            moduleFiles[toModuleFileName(fileName)] = transformExampleModule({ fileName, source });
        } else {
            moduleFiles[fileName] = source;
        }
    }

    return moduleFiles;
};
