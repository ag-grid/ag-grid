import { OpenInCTA } from '@components/open-in-cta/OpenInCTA';
import type { FileContents } from '@features/example-generator/types';
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
}

export const OpenInPlunkr: FunctionComponent<Props> = ({
    title,
    files,
    htmlUrl,
    boilerPlateFiles,
    packageJson,
    fileToOpen,
}) => {
    return (
        <OpenInCTA
            type="plunker"
            onClick={async () => {
                const html = await fetchTextFile(htmlUrl);
                const plunkrExampleFiles = {
                    ...files,
                    ...boilerPlateFiles,
                    'package.json': JSON.stringify(packageJson, null, 2),
                    'index.html': html,
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
