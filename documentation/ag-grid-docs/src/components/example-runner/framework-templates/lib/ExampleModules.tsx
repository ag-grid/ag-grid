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
    internalFramework: InternalFramework;
    isEnterprise: boolean;
    isIntegratedCharts?: boolean;
    usesMathRandom?: boolean;
    /**
     * Whether the example's sources are transpiled in the page rather than served transpiled,
     * which is what Plunker needs (see `BrowserTranspiler`)
     */
    transpileInBrowser?: boolean;
    nonce?: string;
}

/**
 * Example modules are loaded natively by the browser: an import map resolves the bare
 * package specifiers (see `ExampleImportMap`), and the entry file is loaded as a module.
 * TypeScript and JSX sources are transpiled server-side and served as `.js`, so the entry point
 * is requested as such. The exception is Plunker, which is handed the sources as authored --
 * see `transpileInBrowser`.
 */
export const ExampleModules = ({
    appLocation,
    entryFileName,
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
        {/* `transpileInBrowser` marks the pages that are exported rather than served by us */}
        <ExamplePageBoilerplate isExported={transpileInBrowser} nonce={nonce} />
        {transpileInBrowser ? (
            <BrowserTranspiler entryFileName={entryFileName} internalFramework={internalFramework} nonce={nonce} />
        ) : (
            <script nonce={nonce} type="module" src={pathJoin(appLocation, toModuleFileName(entryFileName))} />
        )}
    </>
);
