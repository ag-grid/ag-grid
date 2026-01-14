import type { BeanCollection, CellRange } from 'ag-grid-community';

import { getRefTokenMatches, parseA1Ref } from '../formula/refUtils';

const FORMULA_TOKEN_COLOR_CLASS = 'ag-formula-token-color';
const FORMULA_RANGE_COLOR_CLASS = 'ag-formula-range-color';

// Keep token and range overlay classes in sync for a given color index.
export const getColorClassesForRef = (
    _ref: string,
    colorIndexOverride?: number | null
): { tokenClass: string; rangeClass: string; colorIndex: number } => {
    const index = colorIndexOverride ?? 0;

    return {
        tokenClass: `${FORMULA_TOKEN_COLOR_CLASS}-${index + 1}`,
        rangeClass: `${FORMULA_RANGE_COLOR_CLASS}-${index + 1}`,
        colorIndex: index,
    };
};

// Range overlay helpers
export const getRangeColorIndexFromClass = (colorClass?: string | null): number | null => {
    if (!colorClass) {
        return null;
    }

    const match = /ag-formula-range-color-(\d+)/.exec(colorClass);

    if (!match) {
        return null;
    }

    const parsed = parseInt(match[1], 10);
    return Number.isFinite(parsed) ? parsed - 1 : null;
};

export const tagRangeWithFormulaColor = (
    range: CellRange | undefined,
    ref: string,
    colorIndex?: number | null
): void => {
    if (!range) {
        return;
    }

    const { rangeClass } = getColorClassesForRef(ref, colorIndex);
    range.colorClass = rangeClass;
};

// Range helpers
export const getCellRangeParams = (beans: BeanCollection, ref: string) => {
    // Allow a trailing ":" while the user is still typing a range (e.g. "A1:").
    const parsed = parseA1Ref(ref, { allowTrailingColon: true });
    if (!parsed) {
        return null;
    }

    const { formula } = beans;
    const { startCol, startRow, endCol, endRow } = parsed;
    const startColRef = startCol;
    const endColRef = endCol ?? startCol;
    const startColMatch = formula?.getColByRef(startColRef);
    const endColMatch = formula?.getColByRef(endColRef);

    if (!startColMatch || !endColMatch) {
        return null;
    }

    const rowStartIndex = parseInt(startRow, 10) - 1;
    const rowEndIndex = endRow ? parseInt(endRow, 10) - 1 : rowStartIndex;

    return {
        rowStartIndex,
        rowEndIndex,
        columnStart: startColMatch,
        columnEnd: endColMatch,
    };
};

export const getLatestRangeRef = (beans: BeanCollection): string | null => {
    const ranges = beans.rangeSvc?.getCellRanges();
    const latest = ranges?.length ? ranges[ranges.length - 1] : null;

    if (!latest) {
        return null;
    }

    return rangeToRef(beans, latest);
};

export const rangeToRef = (beans: BeanCollection, range: CellRange): string | null => {
    const { rangeSvc, formula } = beans;

    if (!rangeSvc || !formula) {
        return null;
    }

    const startRow = rangeSvc.getRangeStartRow(range);
    const endRow = rangeSvc.getRangeEndRow(range);

    if (!startRow || !endRow || startRow.rowPinned || endRow.rowPinned) {
        return null;
    }

    const rowStartIndex = Math.min(startRow.rowIndex!, endRow.rowIndex!) + 1;
    const rowEndIndex = Math.max(startRow.rowIndex!, endRow.rowIndex!) + 1;

    const columns = range.columns;

    if (!columns?.length) {
        return null;
    }

    const sorted = [...columns];
    const startCol = sorted[0];
    const endCol = sorted[sorted.length - 1];

    const colStartRef = formula.getColRef(startCol as any);
    const colEndRef = formula.getColRef(endCol as any);

    if (!colStartRef || !colEndRef) {
        return null;
    }

    const sameCol = colStartRef === colEndRef;
    const sameRow = rowStartIndex === rowEndIndex;

    if (sameCol && sameRow) {
        return `${colStartRef}${rowStartIndex}`;
    }

    return `${colStartRef}${rowStartIndex}:${colEndRef}${rowEndIndex}`;
};

type RefToken = { ref: string; index: number };

export const getRefTokensFromText = (text: string): RefToken[] => {
    // Extract A1-style refs/ranges with their occurrence index (left-to-right).
    return getRefTokenMatches(text).map(({ ref, index }) => ({ ref, index }));
};
