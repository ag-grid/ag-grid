import type { AgColumn } from '../entities/agColumn';
import type { ICalculatedColumnsService } from '../interfaces/iCalculatedColumns';

export const CSS_CALCULATED_COLUMN = 'ag-calculated-column';
export const CSS_CALCULATED_COLUMN_HIGHLIGHTED = 'ag-calculated-column-highlighted';

const EMPTY_CALCULATED_COLUMN_CSS_CLASSES: readonly string[] = [];
const CALCULATED_COLUMN_CSS_CLASSES: readonly string[] = [CSS_CALCULATED_COLUMN];
const HIGHLIGHTED_CALCULATED_COLUMN_CSS_CLASSES: readonly string[] = [
    CSS_CALCULATED_COLUMN,
    CSS_CALCULATED_COLUMN_HIGHLIGHTED,
];

export function _getCalculatedColumnCssClasses(
    column: AgColumn | null | undefined,
    calculatedColsSvc: ICalculatedColumnsService | undefined
): readonly string[] {
    if (calculatedColsSvc == null || !column?.isCalculatedCol) {
        return EMPTY_CALCULATED_COLUMN_CSS_CLASSES;
    }

    return calculatedColsSvc.isHighlightedColumn(column)
        ? HIGHLIGHTED_CALCULATED_COLUMN_CSS_CLASSES
        : CALCULATED_COLUMN_CSS_CLASSES;
}
