import type { InternalFramework } from '@ag-grid-types';
import { toModuleFileName } from '@utils/exampleModules/transformExampleModule';
import { pathJoin } from '@utils/pathJoin';

import { BrowserTranspiler } from './BrowserTranspiler';
import { ExampleImportMap } from './ExampleImportMap';
import { ExampleRunnerCall, ExampleRunnerClient } from './ExampleRunnerClient';
import { SeedRandom } from './SeedRandom';

interface Props {
    appLocation: string;
    entryFileName: string;
    fileNames: string[];
    internalFramework: InternalFramework;
    isEnterprise: boolean;
    isIntegratedCharts?: boolean;
    usesMathRandom?: boolean;
    transpileInBrowser?: boolean;
    nonce?: string;
}

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
        <ExampleRunnerClient isExported={transpileInBrowser} nonce={nonce} />
        <ExampleImportMap
            internalFramework={internalFramework}
            isEnterprise={isEnterprise}
            isIntegratedCharts={isIntegratedCharts}
            isExported={transpileInBrowser}
            nonce={nonce}
        />
        {usesMathRandom && <SeedRandom nonce={nonce} />}
        <ExampleRunnerCall fn="setUpPage" nonce={nonce} />
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
