import { useStore } from '@nanostores/react';
import { $queryClient, defaultQueryOptions } from '@stores/queryClientStore';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { fetchExtraFile } from '@utils/client/fetchExtraFile';

import { ApiDocumentation, type ApiDocumentationProps } from './ReferenceDocumentation';

type Props = Omit<ApiDocumentationProps, 'interfaceLookup'>;

export function ApiDocumentationWithQuery(props: Props) {
    const queryClient = useStore($queryClient);

    return (
        <QueryClientProvider client={queryClient}>
            <ApiDocumentationWithLookups {...props} />
        </QueryClientProvider>
    );
}

function ApiDocumentationWithLookups(props: Props) {
    const { data: interfaceLookup } = useQuery({
        queryKey: ['resolved-interfaces'],

        queryFn: async () => {
            const data = await fetchExtraFile('/reference/interfaces.AUTO.json');
            return data;
        },

        ...defaultQueryOptions,
    });

    return interfaceLookup && <ApiDocumentation {...props} interfaceLookup={interfaceLookup} />;
}
