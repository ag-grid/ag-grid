export const AUTO_GROUP_COL_ID = 'ag-Grid-AutoColumn';

export function isAutoGroupColumn(columnId: string): boolean {
    return columnId === AUTO_GROUP_COL_ID || columnId.startsWith(`${AUTO_GROUP_COL_ID}-`);
}

export function cellValueMismatchMsg(columnId: string, expected: unknown, actual: string): string {
    return `HTML cell value mismatch for column id:"${columnId}", expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
}

export function hasSuppressCount(params: unknown): boolean | undefined {
    if (params && typeof params === 'object' && 'suppressCount' in params) {
        return !!(params as any).suppressCount;
    }
    return undefined;
}

export function combineGroupValue(valueText: string, childCountText: string): string {
    return valueText ? (childCountText ? `${valueText} ${childCountText}` : valueText) : childCountText;
}

export function findCellElement(rowElements: HTMLElement[], columnId: string): HTMLElement | null {
    const selector = `[col-id="${CSS.escape(columnId)}"]`;
    for (const rowElement of rowElements) {
        const match = rowElement.querySelector(selector) as HTMLElement | null;
        if (match) {
            return match;
        }
    }
    return null;
}

export function findGroupRowsWrapper(rowElements: HTMLElement[]): HTMLElement | null {
    for (const rowElement of rowElements) {
        const wrapper = rowElement.querySelector('.ag-cell-wrapper.ag-row-group');
        if (wrapper) {
            return wrapper as HTMLElement;
        }
    }
    return null;
}

export function getGroupRowsActualText(wrapper: HTMLElement): string {
    const value = wrapper.querySelector('.ag-group-value')?.textContent?.trim() ?? '';
    const childCount = wrapper.querySelector('.ag-group-child-count')?.textContent?.trim() ?? '';
    return value && childCount ? `${value} ${childCount}` : value || childCount;
}
