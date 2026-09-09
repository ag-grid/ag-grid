import { OpenInCTA } from '@ag-website-shared/components/open-in-cta/OpenInCTA';
import { cleanIndexHtml } from '@ag-website-shared/utils/cleanIndexHtml';
import { fetchRuntimeFiles } from '@ag-website-shared/utils/fetchRuntimeFiles';
import type { FileContents } from '@components/example-generator/types';
import { stripOutExampleGeneratorCode } from '@components/example-runner/components/stripOutExampleGeneratorCode';
import { fetchTextFile } from '@utils/fetchTextFile';
import type { FunctionComponent } from 'react';

import { openPlunker } from '../utils/plunkr';

interface Props {
    title: string;
    files: FileContents;
    htmlUrl: string;
    boilerPlateFiles?: FileContents;
    packageJson: Record<string, any>;
    fileToOpen: string;
    isDev: boolean;
    runtimeFileUrls?: Record<string, string>;
}

export const OpenInPlunkr: FunctionComponent<Props> = ({
    title,
    files,
    htmlUrl,
    boilerPlateFiles,
    packageJson,
    fileToOpen,
    isDev,
    runtimeFileUrls,
}) => {
    return (
        <OpenInCTA
            type="plunker"
            onClick={async () => {
                const html = await fetchTextFile(htmlUrl);
                const runtimeFiles = await fetchRuntimeFiles(runtimeFileUrls);
                const indexHtml = isDev ? cleanIndexHtml(html) : html;
                const localFiles = { ...files };
                stripOutExampleGeneratorCode(localFiles);
                const plunkrExampleFiles = {
                    ...runtimeFiles,
                    ...localFiles,
                    ...boilerPlateFiles,
                    'package.json': JSON.stringify(packageJson, null, 2),
                    'index.html': indexHtml,
                };
                openPlunker({
                    title,
                    files: plunkrExampleFiles,
                    fileToOpen,
                });
            }}
        />
    );
};
