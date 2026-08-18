import type { InternalFramework } from '@ag-grid-types';
import {
    ASSET_REGEX,
    CSS_IMPORT_REGEX,
    SPECIFIER_REGEX,
    STYLESHEET_LOADER_NAME,
    getCompilerOptionNames,
} from '@utils/exampleModules/transformExampleModule';
import ts from 'typescript';

import { ExampleRunnerCall } from './ExampleRunnerClient';

interface Props {
    entryFileName: string;
    fileNames: string[];
    internalFramework: InternalFramework;
    nonce?: string;
}

const TYPESCRIPT_URL = `https://cdn.jsdelivr.net/npm/typescript@${ts.version}/lib/typescript.js`;

const MODULE_EXTENSION_REGEX = /\.(tsx?|jsx?|mjs|cjs)$/i;

export const getTranspilerOptions = (
    entryFileName: string,
    fileNames: string[],
    internalFramework: InternalFramework
) => ({
    entry: `./${entryFileName}`,
    specifierRegex: SPECIFIER_REGEX.source,
    cssImportRegex: CSS_IMPORT_REGEX.source,
    assetRegex: ASSET_REGEX.source,
    moduleExtensionRegex: MODULE_EXTENSION_REGEX.source,
    moduleFiles: fileNames.filter((fileName) => MODULE_EXTENSION_REGEX.test(fileName)),
    compilerOptions: getCompilerOptionNames(internalFramework),
    stylesheetLoaderName: STYLESHEET_LOADER_NAME,
});

export const BrowserTranspiler = ({ entryFileName, fileNames, internalFramework, nonce }: Props) => (
    <>
        <script nonce={nonce} src={TYPESCRIPT_URL} crossOrigin="anonymous" />
        <ExampleRunnerCall
            fn="runTranspiled"
            args={[getTranspilerOptions(entryFileName, fileNames, internalFramework)]}
            nonce={nonce}
        />
    </>
);
