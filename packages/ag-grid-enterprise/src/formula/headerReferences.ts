import type { AgColumn, BeanCollection } from 'ag-grid-community';

interface HeaderReferenceEntry {
    column: AgColumn;
    colId: string;
    leafName: string;
    path: string[];
    reference: string;
}

export function createHeaderReferenceEntries(
    beans: BeanCollection,
    columns: AgColumn[],
    excludedColId?: string
): HeaderReferenceEntry[] {
    const entries = columns
        .filter((column) => column.getColId() !== excludedColId)
        .map<HeaderReferenceEntry>((column) => {
            const path = getColumnPath(beans, column);
            return { column, colId: column.getColId(), leafName: path[path.length - 1], path, reference: '' };
        });

    const candidateCounts = new Map<string, number>();
    for (const entry of entries) {
        for (const candidate of getReferenceCandidates(entry.path)) {
            candidateCounts.set(candidate, (candidateCounts.get(candidate) ?? 0) + 1);
        }
    }

    for (const entry of entries) {
        const unique = getReferenceCandidates(entry.path).find((value) => candidateCounts.get(value) === 1);
        if (unique) {
            entry.reference = unique;
            continue;
        }

        entry.reference = `${joinReferencePath(entry.path)} (${getStableReferenceSuffix(entry.colId)})`;
    }

    return entries;
}

export function isAmbiguousHeaderReference(
    entries: HeaderReferenceEntry[],
    reference: string,
    caseInsensitive = false
): boolean {
    const selectedReferences = new Set(entries.map((entry) => normaliseReference(entry.reference, caseInsensitive)));
    const candidateCounts = new Map<string, number>();
    const normalisedReference = normaliseReference(reference, caseInsensitive);

    for (let i = 0, len = entries.length; i < len; ++i) {
        const candidates = getReferenceCandidates(entries[i].path);
        for (let j = 0, candidatesLen = candidates.length; j < candidatesLen; ++j) {
            const candidate = normaliseReference(candidates[j], caseInsensitive);
            candidateCounts.set(candidate, (candidateCounts.get(candidate) ?? 0) + 1);
        }
    }

    return (candidateCounts.get(normalisedReference) ?? 0) > 1 && !selectedReferences.has(normalisedReference);
}

function getColumnPath(beans: BeanCollection, column: AgColumn): string[] {
    const leaf = getUsableName(beans.colNames.getDisplayNameForColumn(column, 'header'), column.getColId());
    const groups: string[] = [];
    let parent = column.getOriginalParent();

    while (parent) {
        if (!parent.isPadding()) {
            groups.unshift(
                getUsableName(
                    beans.colNames.getDisplayNameForProvidedColumnGroup(null, parent, 'header'),
                    parent.getGroupId()
                )
            );
        }
        parent = parent.getOriginalParent();
    }

    return [...groups, leaf];
}

function getUsableName(name: string | null | undefined, fallback: string): string {
    return name?.trim() || fallback.trim() || fallback;
}

function getReferenceCandidates(path: string[]): string[] {
    const candidates: string[] = [];
    for (let start = path.length - 1; start >= 0; start--) {
        const candidate = joinReferencePath(path.slice(start));
        if (candidate) {
            candidates.push(candidate);
        }
    }
    return candidates;
}

function joinReferencePath(path: string[]): string {
    return path.filter(Boolean).join(' ');
}

function getStableReferenceSuffix(colId: string): string {
    return encodeURIComponent(colId);
}

function normaliseReference(reference: string, caseInsensitive: boolean): string {
    return caseInsensitive ? reference.toLocaleLowerCase() : reference;
}
