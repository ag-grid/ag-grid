import type { InternalFramework } from '@ag-grid-types';
import { OpenInCodeSandbox } from '@ag-website-shared/components/codeSandbox/components/OpenInCodeSandbox';
import { OpenInPlunkr } from '@ag-website-shared/components/plunkr/components/OpenInPlunkr';
import type { FileContents } from '@components/example-generator/types';
import { isReactInternalFramework } from '@utils/framework';

export function ExternalLinks({
    title,
    internalFramework,
    exampleFiles,
    exampleModuleFiles,
    packageJson,
    initialSelectedFile,
    plunkrHtmlUrl,
    codeSandboxHtmlUrl,
    isDev,
}: {
    title: string;
    internalFramework: InternalFramework;
    exampleFiles?: FileContents;
    /**
     * `exampleFiles` transpiled to plain ES modules, for targets that have no build step
     */
    exampleModuleFiles?: FileContents;
    packageJson?: Record<string, any>;
    initialSelectedFile?: string;

    plunkrHtmlUrl?: string;
    codeSandboxHtmlUrl?: string;
    isDev: boolean;
}) {
    // CodeSandbox serves static files for every framework it does not run on a React template,
    // so those need the transpiled modules. Plunker gets the sources as authored and transpiles
    // them in the page instead, so that what a user opens is the TypeScript they were reading.
    const staticFiles = exampleModuleFiles ?? exampleFiles;
    const codeSandboxFiles = isReactInternalFramework(internalFramework) ? exampleFiles : staticFiles;
    const plunkrFiles = exampleFiles ?? staticFiles;

    return (
        <>
            {codeSandboxHtmlUrl && codeSandboxFiles ? (
                <li>
                    <OpenInCodeSandbox
                        title={title}
                        files={codeSandboxFiles}
                        htmlUrl={codeSandboxHtmlUrl}
                        internalFramework={internalFramework}
                        packageJson={packageJson!}
                        isDev={isDev}
                    />
                </li>
            ) : undefined}
            {plunkrHtmlUrl && plunkrFiles ? (
                <li>
                    <OpenInPlunkr
                        title={title}
                        files={plunkrFiles}
                        htmlUrl={plunkrHtmlUrl}
                        packageJson={packageJson!}
                        fileToOpen={initialSelectedFile!}
                        isDev={isDev}
                    />
                </li>
            ) : undefined}
        </>
    );
}
