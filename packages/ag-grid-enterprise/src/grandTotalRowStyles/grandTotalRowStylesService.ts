import type {
    IGrandTotalRowStylesService,
    IRowContainerComp,
    NamedBean,
    RowContainerName,
    RowCtrl,
    RowNode,
} from 'ag-grid-community';
import { BeanStub, _getGrandTotalRow } from 'ag-grid-community';

type BorderSide = 'top' | 'bottom';

interface ContainerState {
    beforeBorderCtrl: RowCtrl | undefined;
    grandTotalAtEdge: boolean;
}

const BEFORE_BORDER_CLASS = 'ag-row-before-grand-total-border';

const isGrandTotalNode = (node: RowNode): boolean => !!node.footer && node.level === -1;

/** True for the grand total row, whether rendered inline, sticky or pinned. */
const isGrandTotalRow = (node: RowNode): boolean =>
    isGrandTotalNode(node) || (!!node.pinnedSibling && isGrandTotalNode(node.pinnedSibling));

export class GrandTotalRowStylesService extends BeanStub implements NamedBean, IGrandTotalRowStylesService {
    beanName = 'grandTotalRowStylesSvc' as const;

    private readonly borderSides = new WeakMap<RowCtrl, BorderSide | null>();
    private readonly containers = new Map<RowContainerName, ContainerState>();

    public addInitialRowClasses(rowCtrl: RowCtrl, classes: string[]): void {
        if (isGrandTotalRow(rowCtrl.rowNode)) {
            classes.push('ag-row-grand-total');
            const side = this.getBorderSide(rowCtrl);
            this.borderSides.set(rowCtrl, side);
            if (side) {
                classes.push(`ag-row-grand-total-border-${side}`);
            }
        } else if (this.isBeforeBorder(rowCtrl)) {
            classes.push(BEFORE_BORDER_CLASS);
        }
    }

    public refreshRow(rowCtrl: RowCtrl): void {
        if (!isGrandTotalRow(rowCtrl.rowNode)) {
            return;
        }
        const side = this.getBorderSide(rowCtrl);
        if (this.borderSides.get(rowCtrl) !== side) {
            this.borderSides.set(rowCtrl, side);
            const rowComp = rowCtrl.getGui()?.rowComp;
            rowComp?.toggleCss('ag-row-grand-total-border-top', side === 'top');
            rowComp?.toggleCss('ag-row-grand-total-border-bottom', side === 'bottom');
        }
    }

    public onDisplayedRowsChanged(
        containerName: RowContainerName,
        containerComp: IRowContainerComp,
        rowCtrls: RowCtrl[]
    ): void {
        const grandTotalCtrl = rowCtrls.find((ctrl) => isGrandTotalRow(ctrl.rowNode));
        const grandTotalIndex = grandTotalCtrl?.rowNode.rowIndex;
        const side = grandTotalCtrl ? this.getBorderSide(grandTotalCtrl) : null;

        let neighbourCtrl: RowCtrl | undefined;
        if (grandTotalIndex != null && side) {
            const neighbourIndex = side === 'top' ? grandTotalIndex - 1 : grandTotalIndex + 1;
            neighbourCtrl = rowCtrls.find((ctrl) => ctrl.rowNode.rowIndex === neighbourIndex);
        }

        let state = this.containers.get(containerName);
        if (!state) {
            state = { beforeBorderCtrl: undefined, grandTotalAtEdge: false };
            this.containers.set(containerName, state);
        }

        const beforeBorderCtrl = side === 'top' ? neighbourCtrl : undefined;
        if (beforeBorderCtrl !== state.beforeBorderCtrl) {
            state.beforeBorderCtrl?.getGui()?.rowComp.toggleCss(BEFORE_BORDER_CLASS, false);
            beforeBorderCtrl?.getGui()?.rowComp.toggleCss(BEFORE_BORDER_CLASS, true);
            state.beforeBorderCtrl = beforeBorderCtrl;
        }

        const grandTotalAtEdge = !!side && !neighbourCtrl;
        if (grandTotalAtEdge !== state.grandTotalAtEdge) {
            state.grandTotalAtEdge = grandTotalAtEdge;
            containerComp.toggleCss('ag-row-container-grand-total-at-edge', grandTotalAtEdge);
        }
    }

    /** The side of the grand total row that faces the data rows, or null for an inline grand total alone on its page. */
    private getBorderSide(rowCtrl: RowCtrl): BorderSide | null {
        const rowPinned = rowCtrl.rowNode.rowPinned;
        if (rowPinned) {
            return rowPinned === 'top' ? 'bottom' : 'top';
        }
        if (_getGrandTotalRow(this.gos) === 'top') {
            return rowCtrl.isLastRowOnPage() ? null : 'bottom';
        }
        return rowCtrl.isFirstRowOnPage() ? null : 'top';
    }

    private isBeforeBorder(rowCtrl: RowCtrl): boolean {
        for (const state of this.containers.values()) {
            if (state.beforeBorderCtrl === rowCtrl) {
                return true;
            }
        }
        return false;
    }
}
