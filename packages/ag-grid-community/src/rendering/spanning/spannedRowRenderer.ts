import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { RowNode } from '../../entities/rowNode';
import type { CellPosition } from '../../interfaces/iCellPosition';
import type { RowPinnedType } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../cell/cellCtrl';
import type { RowCtrl } from '../row/rowCtrl';
import { SpannedRowCtrl } from './spannedRowCtrl';

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
    public createCtrls(ctrlsKey: 'top' | 'bottom' | 'center'): void {
        const { rowSpanSvc } = this.beans;

        const ctrlsName = `${ctrlsKey}Ctrls` as const;
        const previousCtrls = this[ctrlsName];
        const previousCtrlsSize = previousCtrls.size;

        // all currently rendered row ctrls which may have spanned cells
        const rowCtrls = this.getAllRelevantRowControls(ctrlsKey);

        const newRowCtrls = new Map<RowNode, RowCtrl>();

        let hasNewSpans = false;
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
                    previousCtrls.delete(cellSpan.firstNode);
                    return;
                }

                hasNewSpans = true;
                const newCtrl = new SpannedRowCtrl(cellSpan.firstNode, this.beans, false, false, false);
                newRowCtrls.set(cellSpan.firstNode, newCtrl);
            });
        }

        // set even if no change, as we've deleted out of previousCtrls
        this[ctrlsName] = newRowCtrls;

        // if no new cells, and size is equal can assume no removals either.
        const sameCount = newRowCtrls.size === previousCtrlsSize;
        if (!hasNewSpans && sameCount) return;

        for (const oldCtrl of previousCtrls.values()) {
            oldCtrl.destroyFirstPass(true);
            oldCtrl.destroySecondPass();
        }

        this.dispatchLocalEvent({
            type: `spannedRowsUpdated`,
            ctrlsKey,
        });
    }

    // cannot use getAllRowCtrls as it returns this services row ctrls.
    private getAllRelevantRowControls(ctrlsKey: 'top' | 'bottom' | 'center'): RowCtrl[] {
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

        const ctrlsName = `${_normalisePinnedValue(cellPosition.rowPinned)}Ctrls` as const;
        const ctrl = this[ctrlsName].get(cellSpan.firstNode);

        if (!ctrl) {
            return undefined;
        }

        return ctrl.getAllCellCtrls().find((cellCtrl) => cellCtrl.column === cellPosition.column);
    }

    public getCtrls(container: 'top' | 'bottom' | 'center'): RowCtrl[] {
        const ctrlsName = `${container}Ctrls` as const;
        return [...this[ctrlsName].values()];
    }

    private destroyRowCtrls(container: 'top' | 'bottom' | 'center'): void {
        const ctrlsName = `${container}Ctrls` as const;
        for (const ctrl of this[ctrlsName].values()) {
            ctrl.destroyFirstPass(true);
            ctrl.destroySecondPass();
        }
        this[ctrlsName] = new Map();
    }

    public override destroy(): void {
        super.destroy();
        this.destroyRowCtrls('top');
        this.destroyRowCtrls('bottom');
        this.destroyRowCtrls('center');
    }
}

export const _normalisePinnedValue = (pinned: RowPinnedType): 'top' | 'bottom' | 'center' => {
    return pinned ?? 'center';
};
