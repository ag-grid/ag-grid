import type { InternalFramework } from '@ag-grid-types';
import { toModuleFileName } from '@utils/exampleModules/transformExampleModule';
import { pathJoin } from '@utils/pathJoin';

import { BrowserTranspiler } from './BrowserTranspiler';
import { ExampleImportMap } from './ExampleImportMap';
import { ExamplePageBoilerplate } from './ExamplePageBoilerplate';
import { SeedRandom } from './SeedRandom';

interface Props {
    appLocation: string;
    entryFileName: string;
    /** Every file the example ships, as authored. Only the in-browser transpiler needs these */
    fileNames: string[];
    internalFramework: InternalFramework;
    isEnterprise: boolean;
    isIntegratedCharts?: boolean;
    usesMathRandom?: boolean;
    /** Whether the page transpiles the sources itself, as Plunker needs (see `BrowserTranspiler`) */
    transpileInBrowser?: boolean;
    nonce?: string;
}

/**
 * Example modules load natively: an import map resolves the bare package specifiers (see
 * `ExampleImportMap`) and the entry file loads as a module. TypeScript and JSX are transpiled
 * server-side and served as `.js`, so the entry point is requested as such. Plunker is handed the
 * sources as authored; see `transpileInBrowser`.
 */
export const ExampleModules = ({
    appLocation,
    entryFileName,
    fileNames,
    internalFramework,
    isEnterprise,
    isIntegratedCharts,
    usesMathRandom,
    transpileInBrowser,
    nonce,
}: Props) => (
    <>
        <ExampleImportMap
            internalFramework={internalFramework}
            isEnterprise={isEnterprise}
            isIntegratedCharts={isIntegratedCharts}
            isExported={transpileInBrowser}
            nonce={nonce}
        />
        {usesMathRandom && <SeedRandom nonce={nonce} />}
        {/* `transpileInBrowser` marks the exported pages */}
        <ExamplePageBoilerplate isExported={transpileInBrowser} nonce={nonce} />
        {transpileInBrowser ? (
            <BrowserTranspiler
                entryFileName={entryFileName}
                fileNames={fileNames}
                internalFramework={internalFramework}
                nonce={nonce}
            />
        ) : (
            <script nonce={nonce} type="module" src={pathJoin(appLocation, toModuleFileName(entryFileName))} />
        )}
    </>
);
