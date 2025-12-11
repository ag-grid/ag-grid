import type { BeanCollection } from '../context/context';
import type { ColKey } from '../entities/colDef';

export function moveColumnByIndex(beans: BeanCollection, fromIndex: number, toIndex: number): void {
    beans.colMoves?.moveColumnByIndex(fromIndex, toIndex, 'api');
}

export function moveColumns(beans: BeanCollection, columnsToMoveKeys: ColKey[], toIndex: number) {
    beans.colMoves?.moveColumns(columnsToMoveKeys, toIndex, 'api');
}
