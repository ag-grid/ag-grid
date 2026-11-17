import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { RowNode } from '../../entities/rowNode';
import type { CellPosition } from '../../interfaces/iCellPosition';
import type { VerticalSection } from '../../interfaces/iGridSection';
import type { RowPinnedType } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../cell/cellCtrl';
import type { RowCtrl } from '../row/rowCtrl';
import { SpannedRowCtrl } from './spannedRowCtrl';

type SpannedRowContainerType = VerticalSection | 'center';
export class SpannedRowRenderer extends BeanStub<'spannedRowsUpdated'> implements NamedBean {
    beanName = 'spannedRowRenderer' as const;

    public postConstruct(): void {
        this.addManagedEventListeners({
            displayedRowsChanged: this.createAllCtrls.bind(this),
        });
    }

    private topCtrls = new Map<RowNode, RowCtrl>();
    private bottomCtrls = new Map<RowNode, RowCtrl>();
    private centerCtrls = new Map<RowNode, RowCtrl>();

    private createAllCtrls(): void {
        this.createCtrls('top');
        this.createCtrls('bottom');
        this.createCtrls('center');
    }

    /**
     * When displayed rows or cols change, the spanned cell ctrls need to update
     */
    public createCtrls(ctrlsKey: SpannedRowContainerType): void {
        const { rowSpanSvc } = this.beans;

        const previousCtrls = this.getCtrlsMap(ctrlsKey);

        // all currently rendered row ctrls which may have spanned cells
        const rowCtrls = this.getAllRelevantRowControls(ctrlsKey);

        const newRowCtrls = new Map<RowNode, RowCtrl>();

        let hasNewSpans = false;
        // the shown ctrls are replaced only once all are built, so a throw leaves them shown and destroys the new ones
        try {
            for (const ctrl of rowCtrls) {
                // skip cells that are animating out.
                if (!ctrl.isAlive()) {
                    continue;
                }
                rowSpanSvc?.forEachSpannedColumn(ctrl.rowNode, (col, cellSpan) => {
                    // if spanned row ctrl already exists
                    if (newRowCtrls.has(cellSpan.firstNode)) {
                        return;
                    }

                    const existingCtrl = previousCtrls.get(cellSpan.firstNode);
                    if (existingCtrl) {
                        newRowCtrls.set(cellSpan.firstNode, existingCtrl);
                        return;
                    }

                    hasNewSpans = true;
                    const newCtrl = new SpannedRowCtrl(cellSpan.firstNode, this.beans, false, false, false);
                    newRowCtrls.set(cellSpan.firstNode, newCtrl);
                });
            }
        } catch (e) {
            destroyCtrlsNotIn(newRowCtrls, previousCtrls);
            throw e;
        }

        // set even if no change, so the spans keep the order of the rows
        this.setCtrlsMap(ctrlsKey, newRowCtrls);

        // if no new cells, and size is equal can assume no removals either.
        const sameCount = newRowCtrls.size === previousCtrls.size;
        if (!hasNewSpans && sameCount) {
            return;
        }

        destroyCtrlsNotIn(previousCtrls, newRowCtrls);

        this.dispatchLocalEvent({
            type: `spannedRowsUpdated`,
            ctrlsKey,
        });
    }

    // cannot use getAllRowCtrls as it returns this services row ctrls.
    private getAllRelevantRowControls(ctrlsKey: SpannedRowContainerType): RowCtrl[] {
        const { rowRenderer } = this.beans;
        switch (ctrlsKey) {
            case 'top':
                return rowRenderer.topRowCtrls;
            case 'bottom':
                return rowRenderer.bottomRowCtrls;
            case 'center':
                return rowRenderer.allRowCtrls;
        }
    }

    public getCellByPosition(cellPosition: CellPosition): CellCtrl | undefined {
        const { rowSpanSvc } = this.beans;
        const cellSpan = rowSpanSvc?.getCellSpanByPosition(cellPosition);
        if (!cellSpan) {
            return undefined;
        }

        const ctrl = this.getCtrlsMap(cellPosition.rowPinned).get(cellSpan.firstNode);

        if (!ctrl) {
            return undefined;
        }

        return ctrl.getOwnCellCtrl(cellSpan.col);
    }

    /** Refreshes the rows rendering the spans `node` starts, which the row renderer does not hold. */
    public refreshRowsOf(node: RowNode): void {
        this.topCtrls.get(node)?.refreshRow();
        this.bottomCtrls.get(node)?.refreshRow();
        this.centerCtrls.get(node)?.refreshRow();
    }

    public getCtrls(container: SpannedRowContainerType): RowCtrl[] {
        return [...this.getCtrlsMap(container).values()];
    }

    public pushAllCtrls(res: RowCtrl[]): void {
        for (const ctrl of this.topCtrls.values()) {
            res.push(ctrl);
        }
        for (const ctrl of this.bottomCtrls.values()) {
            res.push(ctrl);
        }
        for (const ctrl of this.centerCtrls.values()) {
            res.push(ctrl);
        }
    }

    private destroyRowCtrls(container: SpannedRowContainerType): void {
        for (const ctrl of this.getCtrlsMap(container).values()) {
            ctrl.destroyFirstPass(true);
            ctrl.destroySecondPass();
        }
        this.setCtrlsMap(container, new Map());
    }

    private getCtrlsMap(container: RowPinnedType | 'center'): Map<RowNode, RowCtrl> {
        switch (container) {
            case 'top':
                return this.topCtrls;
            case 'bottom':
                return this.bottomCtrls;
            default:
                return this.centerCtrls;
        }
    }
    private setCtrlsMap(container: RowPinnedType | 'center', map: Map<RowNode, RowCtrl>): void {
        switch (container) {
            case 'top':
                this.topCtrls = map;
                break;
            case 'bottom':
                this.bottomCtrls = map;
                break;
            default:
                this.centerCtrls = map;
                break;
        }
    }

    public override destroy(): void {
        super.destroy();
        this.destroyRowCtrls('top');
        this.destroyRowCtrls('bottom');
        this.destroyRowCtrls('center');
    }
}

function destroyCtrlsNotIn(ctrls: Map<RowNode, RowCtrl>, kept: Map<RowNode, RowCtrl>): void {
    for (const ctrl of ctrls.values()) {
        if (kept.get(ctrl.rowNode) === ctrl) {
            continue;
        }
        ctrl.destroyFirstPass(true);
        ctrl.destroySecondPass();
    }
}
