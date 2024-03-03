import { AgElementFinder } from '../agElements';
import { AG_CELL_RANGE_SINGLE_CELL_CLASSNAME } from '../constants';

interface SingleCellParams {
    agElementFinder: AgElementFinder;
    colIndex: number;
    rowIndex: number;
}

export function selectSingleCell({ agElementFinder, colIndex, rowIndex }: SingleCellParams) {
    const cell = agElementFinder
        .get('cell', {
            colIndex,
            rowIndex,
        })
        ?.get();
    cell?.classList.add(AG_CELL_RANGE_SINGLE_CELL_CLASSNAME);
}

export function clearSingleCell({ agElementFinder, colIndex, rowIndex }: SingleCellParams) {
    const cell = agElementFinder
        .get('cell', {
            colIndex,
            rowIndex,
        })
        ?.get();
    cell?.classList.remove(AG_CELL_RANGE_SINGLE_CELL_CLASSNAME);
}

export function clearAllSingleCellSelections() {
    const focusedCells = document.querySelectorAll(`.${AG_CELL_RANGE_SINGLE_CELL_CLASSNAME}`);
    focusedCells.forEach((cell) => {
        cell.classList.remove(AG_CELL_RANGE_SINGLE_CELL_CLASSNAME);
    });
}
