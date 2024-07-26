import { defaultQueryOptions } from '@stores/queryClientStore';
import { useQuery } from '@tanstack/react-query';
import { fetchExtraFile } from '@utils/client/fetchExtraFile';

export function useResolvedInterfaces() {
    const { data: interfaceLookup } = useQuery({
        queryKey: ['resolved-interfaces'],
        queryFn: () => {
            return fetchExtraFile('/reference/interfaces.AUTO.json');
        },

        ...defaultQueryOptions,
    });

    return interfaceLookup;
}

export function useResolvedDocInterfaces() {
    const { data: codeLookup } = useQuery({
        queryKey: ['resolved-doc-interfaces'],
        queryFn: () => {
            return fetchExtraFile('/reference/doc-interfaces.AUTO.json');
        },

        ...defaultQueryOptions,
    });

    return codeLookup;
}
