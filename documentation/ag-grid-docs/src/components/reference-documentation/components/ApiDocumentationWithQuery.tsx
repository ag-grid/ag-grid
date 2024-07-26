import { useStore } from '@nanostores/react';
import { $queryClient } from '@stores/queryClientStore';
import { QueryClientProvider } from '@tanstack/react-query';

import { useResolvedInterfaces } from '../utils/useResolvedInterfaces';
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
    const interfaceLookup = useResolvedInterfaces();

    return interfaceLookup && <ApiDocumentation {...props} interfaceLookup={interfaceLookup} />;
}
