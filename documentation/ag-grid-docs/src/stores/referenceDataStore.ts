import { fetchExtraFile } from '@utils/client/fetchExtraFile';
import { atom } from 'nanostores';

/** Interfaces type hierarchy — shared across all API reference pages, fetched once per session. */
export const $interfaceLookup = atom<Record<string, any> | undefined>(undefined);

/**
 * Code-source lookup data, keyed by source filename.
 * e.g. { 'grid-options.AUTO.json': { columnDefs: {...}, ... } }
 *
 * Starts as undefined (uninitialised). Set to at least {} once the first island mounts,
 * so Property can distinguish "still waiting" from "no sources needed".
 */
export const $codeData = atom<Record<string, Record<string, any>> | undefined>(undefined);

let interfaceFetching = false;
const fetchedSources = new Set<string>();

export function loadInterfaceLookup() {
    if (interfaceFetching) {
        return;
    }
    interfaceFetching = true;
    fetchExtraFile('/reference/interfaces.AUTO.json').then($interfaceLookup.set);
}

export function loadCodeLookup(sources: string[] | undefined) {
    // Mark as initialised immediately so Property stops waiting even if there are no sources.
    if ($codeData.get() === undefined) {
        $codeData.set({});
    }

    const missing = (sources ?? []).filter((s) => !fetchedSources.has(s));
    if (!missing.length) {
        return;
    }

    missing.forEach((s) => fetchedSources.add(s));

    Promise.all(missing.map(async (s) => [s, await fetchExtraFile(`/reference/${s}`)] as const)).then((pairs) => {
        const next = { ...$codeData.get() };
        pairs.forEach(([s, data]) => {
            next[s] = data;
        });
        $codeData.set(next);
    });
}
