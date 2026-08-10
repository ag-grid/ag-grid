import type { InternalFramework } from '@ag-grid-types';
import { OpenInCodeSandbox } from '@ag-website-shared/components/codeSandbox/components/OpenInCodeSandbox';
import { OpenInPlunkr } from '@ag-website-shared/components/plunkr/components/OpenInPlunkr';
import type { FileContents } from '@components/example-generator/types';
import { toModuleFileName } from '@utils/exampleModules/transformExampleModule';
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
    // Plunker serves static files, so it always needs the transpiled modules. CodeSandbox only
    // does for the frameworks it runs on the `static` template -- its React templates build
    // the TypeScript sources themselves.
    const staticFiles = exampleModuleFiles ?? exampleFiles;
    const codeSandboxFiles = isReactInternalFramework(internalFramework) ? exampleFiles : staticFiles;
    const plunkrFileToOpen = staticFiles && initialSelectedFile && toModuleFileName(initialSelectedFile);

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
            {plunkrHtmlUrl && staticFiles ? (
                <li>
                    <OpenInPlunkr
                        title={title}
                        files={staticFiles}
                        htmlUrl={plunkrHtmlUrl}
                        packageJson={packageJson!}
                        fileToOpen={plunkrFileToOpen!}
                        isDev={isDev}
                    />
                </li>
            ) : undefined}
        </>
    );
}
