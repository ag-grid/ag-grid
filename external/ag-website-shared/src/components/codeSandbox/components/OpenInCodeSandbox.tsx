import type { InternalFramework } from '@ag-grid-types';
import { OpenInCTA } from '@ag-website-shared/components/open-in-cta/OpenInCTA';
import { cleanIndexHtml } from '@ag-website-shared/utils/cleanIndexHtml';
import { fetchRuntimeFiles } from '@ag-website-shared/utils/fetchRuntimeFiles';
import type { FileContents } from '@components/example-generator/types';
import { stripOutExampleGeneratorCode } from '@components/example-runner/components/stripOutExampleGeneratorCode';
import { fetchTextFile } from '@utils/fetchTextFile';
import type { FunctionComponent } from 'react';

import { openCodeSandbox } from '../utils/codeSandbox';

interface Props {
    title: string;
    internalFramework: InternalFramework;
    files: FileContents;
    htmlUrl: string;
    boilerPlateFiles?: FileContents;
    packageJson: Record<string, any>;
    isDev: boolean;
    runtimeFileUrls?: Record<string, string>;
}

export const OpenInCodeSandbox: FunctionComponent<Props> = ({
    title,
    internalFramework,
    files,
    htmlUrl,
    boilerPlateFiles,
    packageJson,
    isDev,
    runtimeFileUrls,
}) => {
    return (
        <OpenInCTA
            type="codesandbox"
            onClick={async () => {
                const html = await fetchTextFile(htmlUrl);
                const runtimeFiles = await fetchRuntimeFiles(runtimeFileUrls);
                const indexHtml = isDev ? cleanIndexHtml(html) : html;
                const localFiles = { ...files };
                stripOutExampleGeneratorCode(localFiles);
                const sandboxFiles = {
                    ...runtimeFiles,
                    ...localFiles,
                    'package.json': JSON.stringify(packageJson, null, 2),

                    'index.html': indexHtml,
                };
                openCodeSandbox({
                    title,
                    files: sandboxFiles,
                    boilerPlateFiles,
                    internalFramework,
                });
            }}
        />
    );
};
