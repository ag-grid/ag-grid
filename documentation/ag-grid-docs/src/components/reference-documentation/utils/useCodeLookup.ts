import { defaultQueryOptions } from '@stores/queryClientStore';
import { useQuery } from '@tanstack/react-query';
import { fetchExtraFile } from '@utils/client/fetchExtraFile';

/**
 * Lazily fetches and merges the code-source AUTO JSON files (e.g. grid-options.AUTO.json)
 * needed to look up gridOpProp entries for detailsCode computation.
 * Only fetches when `enabled` is true (i.e. when a property is expanded).
 */
export function useCodeLookup(codeSources: string[] | undefined, enabled: boolean) {
    const { data } = useQuery({
        queryKey: ['code-lookup', codeSources],
        queryFn: async () => {
            const results = await Promise.all((codeSources ?? []).map((src) => fetchExtraFile(`/reference/${src}`)));
            return Object.assign({}, ...results) as Record<string, any>;
        },
        enabled: enabled && (codeSources?.length ?? 0) > 0,
        ...defaultQueryOptions,
    });
    return data;
}
