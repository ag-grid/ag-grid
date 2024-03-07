import type { InternalFramework } from '@ag-grid-types';
import { OpenInCTA } from '@components/open-in-cta/OpenInCTA';
import type { FileContents } from '@features/example-generator/types';
import { stripOutDarkModeCode } from '@features/example-runner/components/CodeViewer';
import { getIsDev } from '@utils/env';
import { fetchTextFile } from '@utils/fetchTextFile';
import { replaceUrlPrefixWithWindowLocation } from '@utils/replaceUrlPrefixWithWindowLocation';
import type { FunctionComponent } from 'react';

import { openCodeSandbox } from '../utils/codeSandbox';

interface Props {
    title: string;
    internalFramework: InternalFramework;
    files: FileContents;
    htmlUrl: string;
    boilerPlateFiles?: FileContents;
    packageJson: Record<string, any>;
}

export const OpenInCodeSandbox: FunctionComponent<Props> = ({
    title,
    internalFramework,
    files,
    htmlUrl,
    boilerPlateFiles,
    packageJson,
}) => {
    return (
        <OpenInCTA
            type="codesandbox"
            onClick={async () => {
                const html = await fetchTextFile(htmlUrl);
                const indexHtml = getIsDev() ? replaceUrlPrefixWithWindowLocation(html) : html;
                const localFiles = { ...files };
                stripOutDarkModeCode(localFiles);
                const sandboxFiles = {
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
