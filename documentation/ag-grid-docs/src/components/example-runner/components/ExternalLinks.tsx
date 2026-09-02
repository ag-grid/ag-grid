import type { InternalFramework } from '@ag-grid-types';
import { OpenInCodeSandbox } from '@ag-website-shared/components/codeSandbox/components/OpenInCodeSandbox';
import {
    EXAMPLE_RUNNER_SCRIPT_FILE_NAME,
    exampleRunnerScriptSrc,
} from '@ag-website-shared/components/example-runner/components/ExampleRunnerClient';
import { OpenInPlunkr } from '@ag-website-shared/components/plunkr/components/OpenInPlunkr';
import type { FileContents } from '@components/example-generator/types';
import { isReactInternalFramework } from '@utils/framework';

export function ExternalLinks({
    title,
    internalFramework,
    exampleFiles,
    packageJson,
    initialSelectedFile,
    plunkrHtmlUrl,
    codeSandboxHtmlUrl,
    isDev,
}: {
    title: string;
    internalFramework: InternalFramework;
    exampleFiles?: FileContents;
    packageJson?: Record<string, any>;
    initialSelectedFile?: string;

    plunkrHtmlUrl?: string;
    codeSandboxHtmlUrl?: string;
    isDev: boolean;
}) {
    const runtimeFileUrls = { [EXAMPLE_RUNNER_SCRIPT_FILE_NAME]: exampleRunnerScriptSrc() };

    return (
        <>
            {codeSandboxHtmlUrl && exampleFiles ? (
                <li>
                    <OpenInCodeSandbox
                        title={title}
                        files={exampleFiles}
                        htmlUrl={codeSandboxHtmlUrl}
                        internalFramework={internalFramework}
                        packageJson={packageJson}
                        isDev={isDev}
                        runtimeFileUrls={isReactInternalFramework(internalFramework) ? undefined : runtimeFileUrls}
                    />
                </li>
            ) : undefined}
            {plunkrHtmlUrl && exampleFiles ? (
                <li>
                    <OpenInPlunkr
                        title={title}
                        files={exampleFiles}
                        htmlUrl={plunkrHtmlUrl}
                        packageJson={packageJson!}
                        fileToOpen={initialSelectedFile!}
                        isDev={isDev}
                        runtimeFileUrls={runtimeFileUrls}
                    />
                </li>
            ) : undefined}
        </>
    );
}
