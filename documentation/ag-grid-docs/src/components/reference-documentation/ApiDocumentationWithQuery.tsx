import { fetchExtraFile } from '@utils/client/fetchExtraFile';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

import { ApiDocumentation, type ApiDocumentationProps } from './ReferenceDocumentation';

// NOTE: Not on the layout level, as that is generated at build time, and queryClient needs to be
// loaded on the client side
const queryClient = new QueryClient();

const queryOptions = {
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
};

type Props = Omit<ApiDocumentationProps, 'interfaceLookup'>;

export function ApiDocumentationWithQuery(props: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            <ApiDocumentationWithLookups {...props} />
        </QueryClientProvider>
    );
}

function ApiDocumentationWithLookups(props: Props) {
    const { data: interfaceLookup } = useQuery(
        ['resolved-interfaces'],
        async () => {
            const data = await fetchExtraFile('/reference/interfaces.AUTO.json');
            return data;
        },
        queryOptions
    );

    return interfaceLookup && <ApiDocumentation {...props} interfaceLookup={interfaceLookup} />;
}
