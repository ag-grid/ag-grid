import type { Framework, ImportType, InternalFramework } from '@ag-grid-types';
import type { GeneratedContents } from '@features/example-generator/types';
import { ExampleRunner } from '@features/example-runner/components/ExampleRunner';
import { ExternalLinks } from '@features/example-runner/components/ExternalLinks';
import { getLoadingIFrameId } from '@features/example-runner/utils/getLoadingLogoId';
import { useStore } from '@nanostores/react';
import { $internalFramework, $internalFrameworkState } from '@stores/frameworkStore';
import { useImportType } from '@utils/hooks/useImportType';
import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

import {
    type UrlParams,
    getExampleCodeSandboxUrl,
    getExampleContentsUrl,
    getExamplePlunkrUrl,
    getExampleRunnerExampleUrl,
    getExampleUrl,
} from '../utils/urlPaths';

interface Props {
    name: string;
    title: string;
    exampleHeight?: number;
    framework: Framework;
    pageName: string;
    importType: ImportType;
    isDev: boolean;
    typescriptOnly?: boolean;
    overrideImportType?: ImportType;
}

// NOTE: Not on the layout level, as that is generated at build time, and queryClient needs to be
// loaded on the client side
const queryClient = new QueryClient();

const queryOptions = {
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
};

const getInternalFramework = (
    docsInternalFramework: InternalFramework,
    supportedFrameworks: InternalFramework[] | undefined,
    importType: ImportType
): InternalFramework => {
    let internalFramework = docsInternalFramework;
    if (supportedFrameworks && supportedFrameworks.length > 0) {
        if (!supportedFrameworks.includes(docsInternalFramework)) {
            const bestAlternative: Record<InternalFramework, InternalFramework[]> = {
                vanilla: ['typescript'],
                typescript: ['vanilla'],
                reactFunctional: ['reactFunctionalTs', 'typescript', 'vanilla'],
                reactFunctionalTs: ['reactFunctional', 'typescript', 'vanilla'],
                angular: ['typescript', 'vanilla'],
                vue3: ['typescript', 'vanilla'],
            };
            const alternatives = bestAlternative[docsInternalFramework];
            const alternative = alternatives.find((alternative) => supportedFrameworks.includes(alternative));
            if (alternative) {
                internalFramework = alternative;
            }
        }
    }

    if (internalFramework === 'vanilla' && importType === 'modules') {
        internalFramework = 'typescript';
    }
    return internalFramework;
};

const DocsExampleRunnerInner = ({
    name,
    title,
    exampleHeight,
    typescriptOnly,
    overrideImportType,
    pageName,
    isDev,
}: Props) => {
    const exampleName = name;
    const id = `example-${name}`;
    const loadingIFrameId = getLoadingIFrameId({ pageName, exampleName: name });

    const [supportedFrameworks, setSupportedFrameworks] = useState<InternalFramework[] | undefined>(undefined);

    const storeImportType = useImportType();
    const importType = overrideImportType ?? storeImportType;
    const storeInternalFramework = useStore($internalFramework);
    const internalFrameworkState = useStore($internalFrameworkState);
    const internalFramework = typescriptOnly
        ? 'typescript'
        : getInternalFramework(storeInternalFramework, supportedFrameworks, importType);
    const urlConfig: UrlParams = useMemo(
        () => ({ internalFramework, pageName, exampleName, importType }),
        [internalFramework, pageName, exampleName, importType]
    );

    const { data: [contents] = [undefined, undefined], isError } = useQuery(
        ['docsExampleContents', pageName, exampleName, internalFramework, importType, internalFrameworkState],
        () => {
            if (internalFrameworkState !== 'synced') {
                return;
            }

            return Promise.all([
                fetch(getExampleContentsUrl(urlConfig))
                    .then((res) => res.json())
                    .then((json) => {
                        if (json.error) {
                            // eslint-disable-next-line no-console
                            console.error('Error getting', getExampleContentsUrl(urlConfig));
                            return {};
                        }

                        const isTs =
                            internalFramework === 'reactFunctionalTs' ||
                            internalFramework === 'typescript' ||
                            internalFramework === 'angular';
                        if (!isTs) {
                            delete json.files['interfaces.ts'];
                        }
                        if (internalFramework.startsWith('vue') || internalFramework.startsWith('react')) {
                            delete json.files['index.html'];
                        }
                        return json;
                    }),
            ]) as Promise<[GeneratedContents]>;
        },
        queryOptions
    );
    const urls = {
        exampleRunnerExampleUrl: getExampleRunnerExampleUrl(urlConfig),
        exampleUrl: getExampleUrl(urlConfig),
        plunkrHtmlUrl: getExamplePlunkrUrl(urlConfig),
        codeSandboxHtmlUrl: getExampleCodeSandboxUrl(urlConfig),
    };

    useEffect(() => {
        if (isError) {
            setSupportedFrameworks(['typescript']);
        }

        if (!contents) {
            return;
        }

        // If not provided we set to an empty array to finish rendering
        setSupportedFrameworks(contents.supportedFrameworks ?? []);
    }, [contents, isError]);

    const externalLinks = contents ? (
        <ExternalLinks
            title={title}
            internalFramework={internalFramework}
            exampleFiles={contents.files}
            exampleBoilerPlateFiles={contents.boilerPlateFiles}
            packageJson={contents.packageJson}
            initialSelectedFile={contents.mainFileName}
            plunkrHtmlUrl={urls.plunkrHtmlUrl}
            codeSandboxHtmlUrl={urls.codeSandboxHtmlUrl}
            isDev={isDev}
        />
    ) : undefined;

    const validFramework =
        supportedFrameworks &&
        (supportedFrameworks.length == 0 ||
            (supportedFrameworks?.length > 0 && supportedFrameworks?.includes(internalFramework)));
    return validFramework ? (
        <ExampleRunner
            id={id}
            title={title}
            exampleUrl={urls.exampleUrl}
            exampleRunnerExampleUrl={urls.exampleRunnerExampleUrl}
            exampleHeight={exampleHeight}
            exampleFiles={contents?.files}
            initialSelectedFile={contents?.mainFileName}
            internalFramework={internalFramework}
            externalLinks={externalLinks}
            loadingIFrameId={loadingIFrameId}
            supportedFrameworks={supportedFrameworks}
            supportedImportTypes={overrideImportType ? [overrideImportType] : []}
        />
    ) : null;
};

export const DocsExampleRunner = (props: Props) => {
    return (
        <QueryClientProvider client={queryClient}>
            <DocsExampleRunnerInner {...props} />
        </QueryClientProvider>
    );
};
