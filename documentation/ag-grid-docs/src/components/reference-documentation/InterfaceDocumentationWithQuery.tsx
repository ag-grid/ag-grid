import { fetchExtraFile } from '@utils/client/fetchExtraFile';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

import { InterfaceDocumentation, type InterfaceDocumentationProps } from './ReferenceDocumentation';

// NOTE: Not on the layout level, as that is generated at build time, and queryClient needs to be
// loaded on the client side
const queryClient = new QueryClient();

const queryOptions = {
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
};

type Props = Omit<InterfaceDocumentationProps, 'interfaceLookup' | 'codeLookup'>;

export function InterfaceDocumentationWithQuery(props: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            <InterfaceDocumentationWithLookups {...props} />
        </QueryClientProvider>
    );
}

function InterfaceDocumentationWithLookups(props: Props) {
    const { data: [interfaceLookup, codeLookup] = [] } = useQuery(
        ['resolved-interfaces'],
        async () => {
            return Promise.all([
                fetchExtraFile('/reference/interfaces.AUTO.json'),
                fetchExtraFile('/reference/doc-interfaces.AUTO.json'),
            ]);
        },
        queryOptions
    );

    return (
        interfaceLookup &&
        codeLookup && <InterfaceDocumentation {...props} interfaceLookup={interfaceLookup} codeLookup={codeLookup} />
    );
}
