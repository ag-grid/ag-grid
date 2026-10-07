import type { IRowContainerComp, RowContainerName } from '../gridBodyComp/rowContainer/rowContainerCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IGrandTotalRowStylesService {
    addInitialRowClasses(rowCtrl: RowCtrl, classes: string[]): void;
    /** Called when the row's position on the page may have changed. */
    refreshRow(rowCtrl: RowCtrl): void;
    /** Called before the container renders its new rows, so that new rows are created with the right classes. */
    onDisplayedRowsChanged(
        containerName: RowContainerName,
        containerComp: IRowContainerComp,
        rowCtrls: RowCtrl[]
    ): void;
}
