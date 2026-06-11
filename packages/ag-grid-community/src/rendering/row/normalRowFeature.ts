import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import type { RowContainerType } from '../../gridBodyComp/rowContainer/rowContainerCtrl';
import type { RefreshRowsParams } from '../../interfaces/iCellsParams';
import type { ColumnInstanceId, ColumnPinnedType } from '../../interfaces/iColumn';
import type { CellCtrl } from '../cell/cellCtrl';
import { _getCellCtrlForEventTarget, _suppressCellMouseEvent } from '../renderUtils';
import type { IRowModeFeature } from './iRowModeFeature';
import type { RowCtrl } from './rowCtrl';

interface CellCtrlListAndMap {
    list: CellCtrl[];
    map: { [key: ColumnInstanceId]: CellCtrl };
}

export class NormalRowFeature extends BeanStub implements IRowModeFeature {
    private centerCellCtrls: CellCtrlListAndMap = { list: [], map: {} };
    private leftCellCtrls: CellCtrlListAndMap = { list: [], map: {} };
    private rightCellCtrls: CellCtrlListAndMap = { list: [], map: {} };

    private updateColumnListsPending = false;

    public constructor(private readonly rowCtrl: RowCtrl) {
        super();
    }

    public initialiseComp(): void {
        this.updateColumnLists(!this.rowCtrl.useAnimationFrameForCreate);
        this.addListenersForCellComps();
    }

    public refreshRow(params: RefreshRowsParams): void {
        for (const cellCtrl of this.getAllCellCtrls()) {
            cellCtrl.refreshCell(params);
        }

        this.rowCtrl.onNormalRowRefreshed();
    }

    public shouldCreateCellSections(): boolean {
        return true;
    }

    public prepareInitialCellCtrls(): void {
        if (this.rowCtrl.useAnimationFrameForCreate) {
            return;
        }
        this.createAllCellCtrls();
    }

    public getInitialCellCtrls(_containerType: RowContainerType): CellCtrl[] | null {
        if (this.rowCtrl.useAnimationFrameForCreate) {
            return null;
        }
        return this.getAllCellCtrls();
    }

    public getAllCellCtrls(): CellCtrl[] {
        if (this.leftCellCtrls.list.length === 0 && this.rightCellCtrls.list.length === 0) {
            return this.centerCellCtrls.list;
        }
        return [...this.centerCellCtrls.list, ...this.leftCellCtrls.list, ...this.rightCellCtrls.list];
    }

    public recreateCell(cellCtrl: CellCtrl): void {
        this.centerCellCtrls = this.removeCellCtrl(this.centerCellCtrls, cellCtrl);
        this.leftCellCtrls = this.removeCellCtrl(this.leftCellCtrls, cellCtrl);
        this.rightCellCtrls = this.removeCellCtrl(this.rightCellCtrls, cellCtrl);
        cellCtrl.destroy();
        this.updateColumnLists();
    }

    public destroyCells(): void {
        const destroy = (ctrls: CellCtrlListAndMap): CellCtrlListAndMap => {
            for (const c of ctrls.list) {
                c.destroy();
            }
            return { list: [], map: {} };
        };

        this.centerCellCtrls = destroy(this.centerCellCtrls);
        this.leftCellCtrls = destroy(this.leftCellCtrls);
        this.rightCellCtrls = destroy(this.rightCellCtrls);
    }

    public onDisplayedColumnsChanged(): void {
        // skip animations to avoid stale valueGetters when column sets change
        this.updateColumnLists(true);
        this.beans.rowAutoHeight?.requestCheckAutoHeight();
    }

    public onVirtualColumnsChanged(): void {
        this.updateColumnLists(false, true);
    }

    public onColumnMoved(): void {
        this.updateColumnLists();
    }

    public onSpannedCellsUpdated(pinned: ColumnPinnedType): void {
        if (pinned && !this.rowCtrl.rowNode.rowPinned) {
            return;
        }
        this.updateColumnLists();
    }

    private updateColumnLists(suppressAnimationFrame = false, useFlushSync = false): void {
        const { rowCtrl } = this;
        const { animationFrameSvc } = this.beans;
        const noAnimation = !animationFrameSvc?.active || suppressAnimationFrame || rowCtrl.printLayout;

        if (noAnimation) {
            this.updateColumnListsImpl(useFlushSync);
            return;
        }

        if (this.updateColumnListsPending) {
            return;
        }
        animationFrameSvc.createTask(
            () => {
                if (!rowCtrl.isAlive()) {
                    return;
                }
                this.updateColumnListsImpl(true);
            },
            rowCtrl.rowNode.rowIndex!,
            'p1',
            false
        );
        this.updateColumnListsPending = true;
    }

    private updateColumnListsImpl(useFlushSync: boolean): void {
        this.updateColumnListsPending = false;
        this.createAllCellCtrls();
        this.setCellCtrls(useFlushSync);
    }

    private setCellCtrls(useFlushSync: boolean): void {
        const rowGui = this.rowCtrl.getGui();

        if (!rowGui) {
            return;
        }

        rowGui.rowComp.setCellCtrls(this.getAllCellCtrls(), useFlushSync);
        this.rowCtrl.refreshPinnedCellGroupWidths();
    }

    private createAllCellCtrls(): void {
        const { rowCtrl } = this;
        const colViewport = this.beans.colViewport;
        const presentedColsService = this.beans.visibleCols;
        if (rowCtrl.printLayout) {
            this.centerCellCtrls = this.createCellCtrls(this.centerCellCtrls, presentedColsService.allCols);
            this.leftCellCtrls = { list: [], map: {} };
            this.rightCellCtrls = { list: [], map: {} };
        } else {
            const centerCols = colViewport.getColsWithinViewport(rowCtrl.rowNode);
            this.centerCellCtrls = this.createCellCtrls(this.centerCellCtrls, centerCols);

            const leftCols = presentedColsService.getLeftColsForRow(rowCtrl.rowNode);
            this.leftCellCtrls = this.createCellCtrls(this.leftCellCtrls, leftCols, 'left');

            const rightCols = presentedColsService.getRightColsForRow(rowCtrl.rowNode);
            this.rightCellCtrls = this.createCellCtrls(this.rightCellCtrls, rightCols, 'right');
        }
    }

    private createCellCtrls(
        prev: CellCtrlListAndMap,
        cols: AgColumn[],
        pinned: ColumnPinnedType = null
    ): CellCtrlListAndMap {
        const { rowCtrl } = this;
        const res: CellCtrlListAndMap = {
            list: [],
            map: {},
        };

        const addCell = (colInstanceId: ColumnInstanceId, cellCtrl: CellCtrl, index?: number) => {
            if (index == null) {
                res.list.push(cellCtrl);
            } else {
                res.list.splice(index, 0, cellCtrl);
            }
            res.map[colInstanceId] = cellCtrl;
        };
        const colsFromPrev: [colInstanceId: ColumnInstanceId, cellCtrl: CellCtrl][] = [];

        for (const col of cols) {
            // we use instanceId's rather than colId as it's possible there is a Column with same Id,
            // but it's referring to a different column instance. Happens a lot with pivot, as pivot col id's are
            // reused eg pivot_0, pivot_1 etc
            const colInstanceId = col.instanceId;
            let cellCtrl: CellCtrl | undefined = prev.map[colInstanceId];

            // for spanned cells, if the span ref has changed, need to hard refresh cell
            if (cellCtrl && !rowCtrl.isCorrectCtrlForSpan(cellCtrl)) {
                cellCtrl.destroy();
                cellCtrl = undefined;
            }

            cellCtrl ??= rowCtrl.getNewCellCtrl(col);

            if (!cellCtrl) {
                continue;
            }

            addCell(colInstanceId, cellCtrl);
        }

        for (const prevCellCtrl of prev.list) {
            const colInstanceId = prevCellCtrl.column.instanceId;
            const cellInResult = res.map[colInstanceId] != null;

            if (cellInResult) {
                continue;
            }

            const keepCell = !this.isCellEligibleToBeRemoved(prevCellCtrl, pinned);

            if (keepCell) {
                colsFromPrev.push([colInstanceId, prevCellCtrl]);
            } else {
                prevCellCtrl.destroy();
            }
        }

        if (colsFromPrev.length) {
            for (const [colInstanceId, cellCtrl] of colsFromPrev) {
                const index = res.list.findIndex((ctrl) => ctrl.column.left! > cellCtrl.column.left!);
                const normalisedIndex = index === -1 ? undefined : Math.max(index - 1, 0);

                addCell(colInstanceId, cellCtrl, normalisedIndex);
            }
        }

        const { focusSvc } = this.beans;
        const focusedCell = focusSvc.getFocusedCell();
        const focusedCol = focusedCell?.column as AgColumn | undefined;
        // if a cell is focused, might need to be force rendered if it belongs to this pinned section
        if (focusedCol && focusedCol.pinned == pinned) {
            const focusedColInstanceId = focusedCol.instanceId;
            const focusedCellCtrl = res.map[focusedColInstanceId];

            // if focused col is visible, and there's no cell here for it, try to create one
            if (!focusedCellCtrl && focusedCol.displayed) {
                const cellCtrl = this.createFocusedCellCtrl();
                if (cellCtrl) {
                    const index = res.list.findIndex((ctrl) => ctrl.column.left! > cellCtrl.column.left!);
                    const normalisedIndex = index === -1 ? undefined : Math.max(index - 1, 0);
                    addCell(focusedColInstanceId, cellCtrl, normalisedIndex);
                }
            }
        }

        return res;
    }

    private createFocusedCellCtrl(): CellCtrl | undefined {
        const { rowCtrl } = this;
        const { focusSvc, rowSpanSvc } = this.beans;
        const focusedCell = focusSvc.getFocusedCell();
        if (!focusedCell) {
            return undefined;
        }

        const focusedSpan = rowSpanSvc?.getCellSpan(focusedCell.column as AgColumn, rowCtrl.rowNode);
        if (focusedSpan) {
            // if span is focused, and the focused row is not the first in this span, don't create ctrl
            if (focusedSpan.firstNode !== rowCtrl.rowNode || !focusedSpan.doesSpanContain(focusedCell)) {
                return undefined;
            }
        } else if (!focusSvc.isRowFocused(rowCtrl.rowNode.rowIndex!, rowCtrl.rowNode.rowPinned)) {
            // if no span, and the focused cell is not in this row, don't create ctrl
            return undefined;
        }

        return rowCtrl.getNewCellCtrl(focusedCell.column as AgColumn);
    }

    private isCellEligibleToBeRemoved(cellCtrl: CellCtrl, nextContainerPinned: ColumnPinnedType): boolean {
        const REMOVE_CELL = true;
        const KEEP_CELL = false;

        // always remove the cell if it's not rendered or if it's in the wrong pinned location
        const { column } = cellCtrl;
        if (column.pinned != nextContainerPinned) {
            return REMOVE_CELL;
        }

        // if cell is in wrong span container, remove it
        if (!this.rowCtrl.isCorrectCtrlForSpan(cellCtrl)) {
            return REMOVE_CELL;
        }

        // we want to try and keep editing and focused cells
        const { editSvc } = this.beans;
        const editing = editSvc?.isEditing(cellCtrl);
        const focused = cellCtrl.isCellFocused();

        const mightWantToKeepCell = editing || focused;

        if (mightWantToKeepCell) {
            return column.displayed ? KEEP_CELL : REMOVE_CELL;
        }

        return REMOVE_CELL;
    }

    private removeCellCtrl(prev: CellCtrlListAndMap, cellCtrlToRemove: CellCtrl): CellCtrlListAndMap {
        const res: CellCtrlListAndMap = {
            list: [],
            map: {},
        };
        for (const cellCtrl of prev.list) {
            if (cellCtrl === cellCtrlToRemove) {
                continue;
            }
            res.list.push(cellCtrl);
            res.map[cellCtrl.column.instanceId] = cellCtrl;
        }
        return res;
    }

    public isSuppressMouseEvent(mouseEvent: MouseEvent): boolean {
        const cellCtrl = _getCellCtrlForEventTarget(this.gos, mouseEvent.target);
        return cellCtrl != null && _suppressCellMouseEvent(this.gos, cellCtrl.column, this.rowCtrl.rowNode, mouseEvent);
    }

    private addListenersForCellComps(): void {
        const { rowCtrl } = this;
        this.addManagedListeners(rowCtrl.rowNode, {
            rowIndexChanged: () => {
                for (const cellCtrl of this.getAllCellCtrls()) {
                    cellCtrl.onRowIndexChanged();
                }
            },
            cellChanged: (event) => {
                for (const cellCtrl of this.getAllCellCtrls()) {
                    cellCtrl.onCellChanged(event);
                }
            },
        });
    }
}
