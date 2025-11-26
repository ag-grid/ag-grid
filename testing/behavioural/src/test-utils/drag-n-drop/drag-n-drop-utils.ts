import type { GridApi } from 'ag-grid-community';

import { TestGridsManager } from '../testGridsManager';

const DROP_INDICATOR_POSITIONS = ['above', 'inside', 'below'] as const;

export function assertDropIndicatorVisible(api: GridApi): void {
    const { row, dropIndicatorPosition } = api.getRowDropPositionIndicator();

    const gridElement = TestGridsManager.getHTMLElement(api);
    expect(!!gridElement).toBeTruthy();

    if (!gridElement) {
        return;
    }

    const highlightElement = DROP_INDICATOR_POSITIONS.map((position) =>
        gridElement.querySelector<HTMLElement>(`.ag-row-highlight-${position}`)
    ).find((element): element is HTMLElement => !!element);

    if (dropIndicatorPosition === 'none') {
        expect(!!row).toBeFalsy();
        expect(highlightElement).toBeUndefined();
        expect(gridElement.querySelector('.ag-row-highlight-indent')).toBeNull();
        return;
    }

    expect(!!row).toBeTruthy();

    if (!row) {
        return;
    }

    const expectedRowId = row.id ?? undefined;
    expect(expectedRowId).toBeTruthy();

    const rowElement = expectedRowId
        ? gridElement.querySelector<HTMLElement>(`.ag-row[row-id="${expectedRowId}"]`)
        : null;

    expect(rowElement).toBeTruthy();

    if (!rowElement) {
        return;
    }

    const elementWithHighlight = highlightElement ?? rowElement;
    expect(elementWithHighlight).toBeTruthy();

    if (!elementWithHighlight) {
        return;
    }

    const activeClasses = DROP_INDICATOR_POSITIONS.filter((position) =>
        elementWithHighlight.classList.contains(`ag-row-highlight-${position}`)
    );

    expect(activeClasses).toHaveLength(1);
    expect(activeClasses.includes(dropIndicatorPosition)).toBe(true);

    const dropEdge = dropIndicatorPosition === 'above' || dropIndicatorPosition === 'below';
    const isTreeData = api.isModuleRegistered('TreeDataModule') && !!api.getGridOption('treeData');
    const hasGrouping = api.isModuleRegistered('RowGroupingModule') && api.getRowGroupColumns().length > 0;
    const shouldIndent = dropEdge && row.uiLevel > 0 && (isTreeData || hasGrouping);

    const hasIndentClass = elementWithHighlight.classList.contains('ag-row-highlight-indent');
    expect(hasIndentClass).toBe(shouldIndent);

    const actualLevel = elementWithHighlight.style.getPropertyValue('--ag-row-highlight-level');
    const normalizedLevel = actualLevel === '' ? '0' : actualLevel;
    const expectedLevel = shouldIndent ? String(row.uiLevel) : '0';
    expect(normalizedLevel).toBe(expectedLevel);
}
