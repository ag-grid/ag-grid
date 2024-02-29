import type { Framework, ImportType } from '@ag-grid-types';
import type { ExampleType } from '@features/example-generator/types';
import { ExampleRunner } from '@features/example-runner/components/ExampleRunner';
import { ExternalLinks } from '@features/example-runner/components/ExternalLinks';
import { getLoadingIFrameId } from '@features/example-runner/utils/getLoadingLogoId';
import { useStore } from '@nanostores/react';
import { $frameworkContext, $internalFramework, updateInternalFrameworkBasedOnFramework } from '@stores/frameworkStore';
import { getFrameworkFromInternalFramework } from '@utils/framework';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

import {
    getExampleCodeSandboxUrl,
    getExampleContentsUrl,
    getExamplePlunkrUrl,
    getExampleRunnerExampleUrl,
    getExampleUrl,
} from '../utils/urlPaths';

interface Props {
    name: string;
    title: string;
    exampleType?: ExampleType;
    exampleHeight?: number;
    framework: Framework;
    pageName: string;
    importType: ImportType;
}

// NOTE: Not on the layout level, as that is generated at build time, and queryClient needs to be
// loaded on the client side
const queryClient = new QueryClient();

/**
 * Update the internal framework if it is different to the framework in the URL
 *
 * @param framework Framework from the URL
 */
function useUpdateInternalFrameworkFromFramework(framework: Framework) {
    const internalFramework = useStore($internalFramework);

    useEffect(() => {
        const frameworkFromInternalFramework = getFrameworkFromInternalFramework(internalFramework);
        if (frameworkFromInternalFramework !== framework) {
            updateInternalFrameworkBasedOnFramework(framework);
        }
    }, [internalFramework, framework]);
}

const queryOptions = {
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
};

const DocsExampleRunnerInner = ({ name, title, exampleType, exampleHeight, framework, pageName }: Props) => {
    const internalFramework = useStore($internalFramework);
    const frameworkStore = useStore($frameworkContext);
    const importType = frameworkStore['importType'];
    const [initialSelectedFile, setInitialSelectedFile] = useState();
    const [exampleUrl, setExampleUrl] = useState<string>();
    const [exampleRunnerExampleUrl, setExampleRunnerExampleUrl] = useState<string>();
    const [codeSandboxHtmlUrl, setCodeSandboxHtmlUrl] = useState<string>();
    const [plunkrHtmlUrl, setPlunkrHtmlUrl] = useState<string>();
    const [exampleFiles, setExampleFiles] = useState();
    const [exampleBoilerPlateFiles, setExampleBoilerPlateFiles] = useState();
    const [packageJson, setPackageJson] = useState();

    const exampleName = name;
    const id = `example-${name}`;
    const loadingIFrameId = getLoadingIFrameId({ pageName, exampleName: name });

    const {
        isLoading: contentsIsLoading,
        isError: contentsIsError,
        data: [contents, exampleFileHtml] = [],
    } = useQuery(
        ['docsExampleContents', internalFramework, pageName, exampleName],
        () => {
            const getContents = fetch(
                getExampleContentsUrl({
                    internalFramework,
                    pageName,
                    exampleName,
                    importType,
                })
            ).then((res) => res.json());

            const getExampleFileHtml = fetch(
                getExampleUrl({
                    internalFramework,
                    pageName,
                    exampleName,
                    importType,
                })
            ).then((res) => res.text());
            return Promise.all([getContents, getExampleFileHtml]);
        },
        queryOptions
    );

    useEffect(() => {
        if (!exampleName) {
            return;
        }

        setExampleUrl(
            getExampleUrl({
                internalFramework,
                pageName,
                exampleName,
                importType,
            })
        );
        setExampleRunnerExampleUrl(
            getExampleRunnerExampleUrl({
                internalFramework,
                pageName,
                exampleName,
                importType,
            })
        );
    }, [internalFramework, pageName, exampleName]);

    useEffect(() => {
        if (!contents || contentsIsLoading || contentsIsError) {
            return;
        }
        setInitialSelectedFile(contents?.mainFileName);
    }, [contents, contentsIsLoading, contentsIsError]);

    useEffect(() => {
        setCodeSandboxHtmlUrl(
            getExampleCodeSandboxUrl({
                internalFramework,
                pageName,
                exampleName,
                importType,
            })
        );

        setPlunkrHtmlUrl(
            getExamplePlunkrUrl({
                internalFramework,
                pageName,
                exampleName,
                importType,
            })
        );
    }, [internalFramework, pageName, exampleName]);

    useEffect(() => {
        if (!contents || contentsIsLoading || contentsIsError || !exampleFileHtml) {
            return;
        }
        const files = {
            ...contents.files,
            // Override `index.html` with generated file as
            // exampleFiles endpoint only gets the index html fragment
            'index.html': exampleFileHtml,
        };

        setExampleFiles(files);
        setPackageJson(contents.packageJson);
        setExampleBoilerPlateFiles(contents.boilerPlateFiles);
    }, [contents, contentsIsLoading, contentsIsError, exampleFileHtml]);

    useUpdateInternalFrameworkFromFramework(framework);

    const externalLinks = (
        <ExternalLinks
            title={title}
            internalFramework={internalFramework}
            exampleFiles={exampleFiles}
            exampleBoilerPlateFiles={exampleBoilerPlateFiles}
            packageJson={packageJson}
            initialSelectedFile={initialSelectedFile}
            plunkrHtmlUrl={plunkrHtmlUrl}
            codeSandboxHtmlUrl={codeSandboxHtmlUrl}
        />
    );

    return (
        <ExampleRunner
            id={id}
            exampleUrl={exampleUrl}
            exampleRunnerExampleUrl={exampleRunnerExampleUrl}
            exampleType={exampleType}
            exampleHeight={exampleHeight}
            exampleFiles={exampleFiles}
            initialSelectedFile={initialSelectedFile}
            internalFramework={internalFramework}
            externalLinks={externalLinks}
            loadingIFrameId={loadingIFrameId}
        />
    );
};

export const DocsExampleRunner = (props: Props) => {
    return (
        <QueryClientProvider client={queryClient}>
            <DocsExampleRunnerInner {...props} />
        </QueryClientProvider>
    );
};
