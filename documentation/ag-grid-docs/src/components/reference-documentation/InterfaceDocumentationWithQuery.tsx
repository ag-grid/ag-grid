import { useStore } from '@nanostores/react';
import { $queryClient, defaultQueryOptions } from '@stores/queryClientStore';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { fetchExtraFile } from '@utils/client/fetchExtraFile';

import { InterfaceDocumentation, type InterfaceDocumentationProps } from './ReferenceDocumentation';

type Props = Omit<InterfaceDocumentationProps, 'interfaceLookup' | 'codeLookup'>;

export function InterfaceDocumentationWithQuery(props: Props) {
    const queryClient = useStore($queryClient);

    return (
        <QueryClientProvider client={queryClient}>
            <InterfaceDocumentationWithLookups {...props} />
        </QueryClientProvider>
    );
}

function InterfaceDocumentationWithLookups(props: Props) {
    const { data: [interfaceLookup, codeLookup] = [] } = useQuery({
        queryKey: ['resolved-interfaces-docs'],

        queryFn: async () => {
            return Promise.all([
                fetchExtraFile('/reference/interfaces.AUTO.json'),
                fetchExtraFile('/reference/doc-interfaces.AUTO.json'),
            ]);
        },

        ...defaultQueryOptions,
    });

    return (
        interfaceLookup &&
        codeLookup && <InterfaceDocumentation {...props} interfaceLookup={interfaceLookup} codeLookup={codeLookup} />
    );
}
