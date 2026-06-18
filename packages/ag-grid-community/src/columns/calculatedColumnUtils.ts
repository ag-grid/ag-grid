import type { ColDef } from '../entities/colDef';
import type { CalculatedColumnsGridOption } from '../interfaces/iCalculatedColumns';

/** @internal AG_GRID_INTERNAL */
export function _hasCalculatedExpression(colDef: ColDef | null | undefined): boolean {
    return colDef?.calculatedExpression !== undefined;
}

/** @internal AG_GRID_INTERNAL */
export function _isCalculatedColumnsEnabled(calculatedColumns: CalculatedColumnsGridOption | undefined): boolean {
    return calculatedColumns != null && calculatedColumns !== false;
}

/** @internal AG_GRID_INTERNAL */
export function _normaliseCalculatedExpression(expression: ColDef['calculatedExpression'] | null): string | undefined {
    return expression === undefined ? undefined : (expression ?? '');
}
