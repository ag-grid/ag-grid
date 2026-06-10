import { $queryClient, QueryClientProvider } from '@stores/queryClientStore';
import { createContext, type ReactNode, useContext } from 'react';

import { useCodeLookup } from '../utils/useCodeLookup';
import { useResolvedInterfaces } from '../utils/useResolvedInterfaces';

interface ReferenceDataContextValue {
    interfaceLookup: Record<string, any> | undefined;
    codeLookup: Record<string, any> | undefined;
    /** True when codeSources were provided — i.e. codeLookup=undefined means still loading, not absent. */
    hasCodeSources: boolean;
}

const ReferenceDataContext = createContext<ReferenceDataContextValue>({
    interfaceLookup: undefined,
    codeLookup: undefined,
    hasCodeSources: false,
});

/**
 * Inner component: runs inside QueryClientProvider so useQuery hooks have a client in their
 * ancestor tree. Fetches and provides reference data via context.
 */
function ReferenceDataFetcher({
    codeSources,
    children,
}: {
    codeSources?: string[];
    children: ReactNode;
}) {
    const interfaceLookup = useResolvedInterfaces();
    const codeLookup = useCodeLookup(codeSources, true);
    const hasCodeSources = (codeSources?.length ?? 0) > 0;

    return (
        <ReferenceDataContext.Provider value={{ interfaceLookup, codeLookup, hasCodeSources }}>
            {children}
        </ReferenceDataContext.Provider>
    );
}

/**
 * Provides reference lookup data (interfaceLookup, codeLookup) to all descendant Property
 * components. Owns the QueryClientProvider so consumers don't need to.
 */
export function ReferenceDataProvider({
    codeSources,
    children,
}: {
    codeSources?: string[];
    children: ReactNode;
}) {
    return (
        <QueryClientProvider client={$queryClient.get()}>
            <ReferenceDataFetcher codeSources={codeSources}>
                {children}
            </ReferenceDataFetcher>
        </QueryClientProvider>
    );
}

export function useReferenceData() {
    return useContext(ReferenceDataContext);
}
