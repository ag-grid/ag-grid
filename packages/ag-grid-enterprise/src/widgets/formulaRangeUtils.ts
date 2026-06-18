import type { AgColumn, BeanCollection, CellRange, IClientSideRowModel } from 'ag-grid-community';
import { _getRowNode, isSpecialCol } from 'ag-grid-community';

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

type FormulaRangeParams = { rowStartIndex: number; rowEndIndex: number; columnStart: AgColumn; columnEnd: AgColumn };

// Range helpers
export const getCellRangeParams = (beans: BeanCollection, ref: string): FormulaRangeParams | null => {
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

    // guard against invalid rows so we don't tokenise refs outside the known row set.
    if (rowStartIndex < 0 || rowEndIndex < 0) {
        return null;
    }

    const rowModel = beans.rowModel as IClientSideRowModel | null;
    // formulas run on the client-side row model, so use formula rows to validate.
    if (!rowModel?.getFormulaRow(rowStartIndex) || !rowModel.getFormulaRow(rowEndIndex)) {
        return null;
    }

    return {
        rowStartIndex,
        rowEndIndex,
        columnStart: startColMatch,
        columnEnd: endColMatch,
    };
};

/** Convert formula-row-based params to display-index-based params for the range service.
 *  Clamps to the visible portion when endpoints are filtered out. Returns null if no
 *  rows in the range are currently visible. */
export const toDisplayRangeParams = (beans: BeanCollection, params: FormulaRangeParams): FormulaRangeParams | null => {
    const rowModel = beans.rowModel as IClientSideRowModel | null;
    if (!rowModel) {
        return null;
    }

    const { rowStartIndex, rowEndIndex } = params;

    let displayStart: number | null = null;
    for (let i = rowStartIndex; i <= rowEndIndex; i++) {
        const idx = rowModel.getFormulaRow(i)?.rowIndex;
        if (idx != null) {
            displayStart = idx;
            break;
        }
    }

    let displayEnd: number | null = null;
    for (let i = rowEndIndex; i >= rowStartIndex; i--) {
        const idx = rowModel.getFormulaRow(i)?.rowIndex;
        if (idx != null) {
            displayEnd = idx;
            break;
        }
    }

    if (displayStart == null || displayEnd == null) {
        return null;
    }

    return { ...params, rowStartIndex: displayStart, rowEndIndex: displayEnd };
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

    const startNode = _getRowNode(beans, startRow);
    const endNode = _getRowNode(beans, endRow);
    const startFormulaIdx = startNode?.formulaRowIndex;
    const endFormulaIdx = endNode?.formulaRowIndex;

    if (startFormulaIdx == null || endFormulaIdx == null) {
        return null;
    }

    const rowStartIndex = Math.min(startFormulaIdx, endFormulaIdx) + 1;
    const rowEndIndex = Math.max(startFormulaIdx, endFormulaIdx) + 1;

    // ignore selection/row-number columns and any columns without A1 refs
    const columns = range.columns?.filter((col) => !isSpecialCol(col) && !!formula.getColRef(col as AgColumn));
    if (!columns?.length) {
        return null;
    }

    const sorted = [...columns];
    const startCol = sorted[0];
    const endCol = sorted[sorted.length - 1];

    const colStartRef = formula.getColRef(startCol as AgColumn);
    const colEndRef = formula.getColRef(endCol as AgColumn);

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
type RefTokenMatch = { ref: string; start: number; end: number; index: number };

export const getRefTokenMatchesForFormula = (beans: BeanCollection, text: string): RefTokenMatch[] => {
    const matches = getRefTokenMatches(text);
    const { formula } = beans;

    if (!formula) {
        return matches;
    }

    const valid: RefTokenMatch[] = [];
    let index = 0;

    for (const match of matches) {
        if (!getCellRangeParams(beans, match.ref)) {
            continue;
        }
        valid.push({ ...match, index });
        index += 1;
    }

    return valid;
};

export const getRefTokensFromText = (beans: BeanCollection, text: string): RefToken[] => {
    // Extract A1-style refs/ranges with their occurrence index (left-to-right).
    const matches = getRefTokenMatchesForFormula(beans, text);
    return matches.map(({ ref, index }) => ({ ref, index }));
};
