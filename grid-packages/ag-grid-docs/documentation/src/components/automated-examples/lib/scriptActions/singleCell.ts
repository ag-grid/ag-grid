import { getCell } from '../agQuery';
import { AG_CELL_RANGE_SINGLE_CELL_CLASSNAME } from '../constants';

interface SingleCellParams {
    containerEl?: HTMLElement;
    colIndex: number;
    rowIndex: number;
}

export function selectSingleCell({ containerEl, colIndex, rowIndex }: SingleCellParams) {
    const cell = getCell({
        containerEl,
        colIndex,
        rowIndex,
    });
    cell?.classList.add(AG_CELL_RANGE_SINGLE_CELL_CLASSNAME);
}

export function clearSingleCell({ containerEl, colIndex, rowIndex }: SingleCellParams) {
    const cell = getCell({
        containerEl,
        colIndex,
        rowIndex,
    });
    cell?.classList.remove(AG_CELL_RANGE_SINGLE_CELL_CLASSNAME);
}

export function clearAllSingleCellSelections() {
    const focusedCells = document.querySelectorAll(`.${AG_CELL_RANGE_SINGLE_CELL_CLASSNAME}`);
    focusedCells.forEach((cell) => {
        cell.classList.remove(AG_CELL_RANGE_SINGLE_CELL_CLASSNAME);
    });
}
