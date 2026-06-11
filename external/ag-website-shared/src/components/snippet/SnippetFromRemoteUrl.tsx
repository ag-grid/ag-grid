import type { Language } from '@ag-website-shared/components/code/CodeShiki';
import CodeShiki from '@ag-website-shared/components/code/CodeShiki';
import type { FunctionComponent } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

interface Props {
    url: string;
    language: Language;
    lineNumbers: boolean;
}

const queryClient = new QueryClient();
const queryOptions = {
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
};

export const SnippetFromRemoteUrlInner: FunctionComponent<Props> = ({ url, language, lineNumbers }) => {
    const { data: snippet } = useQuery(['snippet', url], () => fetch(url).then((res) => res.text()), queryOptions);
    return snippet ? <CodeShiki code={snippet} language={language} lineNumbers={lineNumbers} /> : undefined;
};

export const SnippetFromRemoteUrl = (props: Props) => {
    return (
        <QueryClientProvider client={queryClient}>
            <SnippetFromRemoteUrlInner {...props} />
        </QueryClientProvider>
    );
};
