export type RowElementReference = Element | string | null | undefined;

export function collectRowElements(gridElement: HTMLElement | null | undefined): HTMLElement[] {
    return gridElement ? Array.from(gridElement.querySelectorAll<HTMLElement>('[row-id]')) : [];
}

export function buildRowElementsMap(rowElements: Iterable<HTMLElement>): Map<string, HTMLElement[]> {
    const map = new Map<string, HTMLElement[]>();

    for (const rowElement of rowElements) {
        const rowId = rowElement.getAttribute('row-id');
        if (!rowId) {
            continue;
        }

        const existing = map.get(rowId);
        const isMainRowElement = rowElement.closest('.ag-center-cols-container') !== null;

        if (existing) {
            const index = existing.indexOf(rowElement);
            if (index >= 0) {
                if (isMainRowElement && index > 0) {
                    existing.splice(index, 1);
                    existing.unshift(rowElement);
                }
            } else if (isMainRowElement) {
                existing.unshift(rowElement);
            } else {
                existing.push(rowElement);
            }
        } else {
            map.set(rowId, [rowElement]);
        }
    }

    return map;
}

export function resolveRowElement(
    rowElementsMap: Map<string, HTMLElement[]>,
    reference: RowElementReference
): HTMLElement | null {
    if (!reference) {
        return null;
    }

    if (typeof reference === 'string') {
        const elements = rowElementsMap.get(reference);
        return elements?.[0] ?? null;
    }

    const element = reference as Element;
    const rowElement = element.classList.contains('ag-row')
        ? (element as HTMLElement)
        : (element.closest('.ag-row') as HTMLElement | null);

    if (!rowElement) {
        return null;
    }

    const rowId = rowElement.getAttribute('row-id');
    if (!rowId) {
        return rowElement;
    }

    const elements = rowElementsMap.get(rowId);
    return elements?.[0] ?? rowElement;
}
