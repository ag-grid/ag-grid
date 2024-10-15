import type { InternalFramework } from '@ag-grid-types';
import { OpenInCTA } from '@ag-website-shared/components/open-in-cta/OpenInCTA';
import { cleanIndexHtml } from '@ag-website-shared/utils/cleanIndexHtml';
import { updateHtmlWithDarkMode } from '@ag-website-shared/utils/updateHtmlWithDarkMode';
import type { FileContents } from '@features/example-generator/types';
import { stripOutDarkModeCode } from '@features/example-runner/components/CodeViewer';
import { fetchTextFile } from '@utils/fetchTextFile';
import { useDarkmode } from '@utils/hooks/useDarkmode';
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
}

export const OpenInCodeSandbox: FunctionComponent<Props> = ({
    title,
    internalFramework,
    files,
    htmlUrl,
    boilerPlateFiles,
    packageJson,
    isDev,
}) => {
    const [isDarkMode] = useDarkmode();

    return (
        <OpenInCTA
            type="codesandbox"
            onClick={async () => {
                const html = await fetchTextFile(htmlUrl);
                const cleanedHtml = isDev ? cleanIndexHtml(html) : html;
                const indexHtml = updateHtmlWithDarkMode({ html: cleanedHtml, isDarkMode });
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
