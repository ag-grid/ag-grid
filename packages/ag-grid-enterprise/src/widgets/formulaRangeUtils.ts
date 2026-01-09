import type { BeanCollection, CellRange } from 'ag-grid-community';

// Allow partial ranges (eg "A1:") so we keep typing within the same token until a breaking operator is entered.
export const CELL_OR_RANGE_REGEX = /\$?[A-Za-z]+\$?[0-9]+(?::\$?[A-Za-z]+\$?[0-9]+)?:?/g;
// Parses a complete A1 reference or range like "A1" or "A1:B2" (no trailing colon).
const FULL_CELL_OR_RANGE_REGEX = /^\$?([A-Za-z]+)\$?(\d+)(?::\$?([A-Za-z]+)\$?(\d+))?$/;

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
    const normalizedRef = ref.endsWith(':') ? ref.slice(0, -1) : ref;
    const match = FULL_CELL_OR_RANGE_REGEX.exec(normalizedRef);
    if (!match) {
        return null;
    }

    const { formula } = beans;

    const [, startColRef, startRowStr, endColRef, endRowStr] = match;
    const startCol = formula?.getColByRef(startColRef);
    const endCol = formula?.getColByRef(endColRef ?? startColRef);

    if (!startCol || !endCol) {
        return null;
    }

    const rowStartIndex = parseInt(startRowStr, 10) - 1;
    const rowEndIndex = endRowStr ? parseInt(endRowStr, 10) - 1 : rowStartIndex;

    return {
        rowStartIndex,
        rowEndIndex,
        columnStart: startCol,
        columnEnd: endCol,
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
    const tokens: RefToken[] = [];
    let match: RegExpExecArray | null;
    let index = 0;
    CELL_OR_RANGE_REGEX.lastIndex = 0;
    while ((match = CELL_OR_RANGE_REGEX.exec(text)) != null) {
        tokens.push({ ref: match[0], index });
        index += 1;
    }
    return tokens;
};
