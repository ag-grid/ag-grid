import type { Framework, ImportType, InternalFramework } from '@ag-grid-types';
import type { FileContents, GeneratedContents } from '@features/example-generator/types';
import { ExampleRunner } from '@features/example-runner/components/ExampleRunner';
import { ExternalLinks } from '@features/example-runner/components/ExternalLinks';
import { getLoadingIFrameId } from '@features/example-runner/utils/getLoadingLogoId';
import { useStore } from '@nanostores/react';
import { $internalFramework } from '@stores/frameworkStore';
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
    supportedFrameworks: InternalFramework[] | undefined
): InternalFramework => {
    if (supportedFrameworks && supportedFrameworks.length > 0) {
        if (supportedFrameworks.includes(docsInternalFramework)) {
            return docsInternalFramework;
        }
        const bestAlternative: Record<InternalFramework, InternalFramework[]> = {
            vanilla: ['typescript'],
            typescript: ['vanilla'],
            reactFunctional: ['reactFunctionalTs', 'typescript', 'vanilla'],
            reactFunctionalTs: ['reactFunctional', 'typescript', 'vanilla'],
            angular: ['typescript', 'vanilla'],
            vue: ['typescript', 'vanilla'],
            vue3: ['typescript', 'vanilla'],
        };
        const alternatives = bestAlternative[docsInternalFramework];
        const alternative = alternatives.find((alternative) => supportedFrameworks.includes(alternative));
        if (alternative) {
            return alternative;
        }
    }

    return docsInternalFramework;
};

const getImportType = (docsImportType: ImportType, supportedImportTypes: ImportType[] | undefined): ImportType => {
    if (supportedImportTypes === undefined || supportedImportTypes.length === 0) {
        return docsImportType;
    }
    if (supportedImportTypes.includes(docsImportType)) {
        return docsImportType;
    }
    return supportedImportTypes[0];
};

const DocsExampleRunnerInner = ({ name, title, exampleHeight, typescriptOnly, pageName, isDev }: Props) => {
    const exampleName = name;
    const id = `example-${name}`;
    const loadingIFrameId = getLoadingIFrameId({ pageName, exampleName: name });

    const [exampleFiles, setExampleFiles] = useState<FileContents>();
    const [supportedFrameworks, setSupportedFrameworks] = useState<InternalFramework[] | undefined>(undefined);
    const [supportedImportTypes, setSupportedImportTypes] = useState<ImportType[] | undefined>(undefined);

    const internalFramework = typescriptOnly
        ? 'typescript'
        : getInternalFramework(useStore($internalFramework), supportedFrameworks);
    const importType = getImportType(useImportType(), supportedImportTypes);
    const urlConfig: UrlParams = useMemo(
        () => ({ internalFramework, pageName, exampleName, importType }),
        [internalFramework, pageName, exampleName, importType]
    );

    const { data: [contents, exampleFileHtml] = [undefined, undefined] } = useQuery(
        ['docsExampleContents', pageName, exampleName, internalFramework, importType],
        () =>
            Promise.all([
                fetch(getExampleContentsUrl(urlConfig)).then((res) => res.json()),
                fetch(getExampleUrl(urlConfig)).then((res) => res.text()),
            ]) as Promise<[GeneratedContents, string]>,
        queryOptions
    );
    const urls = {
        exampleRunnerExampleUrl: getExampleRunnerExampleUrl(urlConfig),
        exampleUrl: getExampleUrl(urlConfig),
        plunkrHtmlUrl: getExamplePlunkrUrl(urlConfig),
        codeSandboxHtmlUrl: getExampleCodeSandboxUrl(urlConfig),
    };

    useEffect(() => {
        if (!contents || !exampleFileHtml) {
            return;
        }
        const files = {
            ...contents.files,
            // Override `index.html` with generated file as
            // exampleFiles endpoint only gets the index html fragment
            'index.html': exampleFileHtml,
        };
        setExampleFiles(files);

        // If not provided we set to an empty array to finish rendering
        setSupportedFrameworks(contents.supportedFrameworks ?? []);
        setSupportedImportTypes(contents.supportedImportTypes ?? []);
    }, [contents, exampleFileHtml]);

    const externalLinks =
        exampleFiles && contents ? (
            <ExternalLinks
                title={title}
                internalFramework={internalFramework}
                exampleFiles={exampleFiles}
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
    const validImportType =
        supportedImportTypes &&
        (supportedImportTypes.length == 0 ||
            (supportedImportTypes?.length > 0 && supportedImportTypes?.includes(importType)));
    return validFramework && validImportType ? (
        <ExampleRunner
            id={id}
            exampleUrl={urls.exampleUrl}
            exampleRunnerExampleUrl={urls.exampleRunnerExampleUrl}
            exampleHeight={exampleHeight}
            exampleFiles={exampleFiles}
            initialSelectedFile={contents?.mainFileName}
            internalFramework={internalFramework}
            externalLinks={externalLinks}
            loadingIFrameId={loadingIFrameId}
            supportedFrameworks={supportedFrameworks}
            supportedImportTypes={supportedImportTypes}
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
