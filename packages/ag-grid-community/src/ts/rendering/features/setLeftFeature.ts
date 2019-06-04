import { ColumnGroupChild } from "../../entities/columnGroupChild";
import { Column } from "../../entities/column";
import { BeanStub } from "../../context/beanStub";
import { Beans } from "../beans";
import { Constants } from "../../constants";
import { _ } from "../../utils";

export class SetLeftFeature extends BeanStub {

    private readonly columnOrGroup: ColumnGroupChild;
    private eCell: HTMLElement;

    private actualLeft: number;

    // if we are spanning columns, this tells what columns,
    // otherwise this is empty
    private colsSpanning: Column[];

    private beans: Beans;

    private readonly printLayout: boolean;

    constructor(columnOrGroup: ColumnGroupChild, eCell: HTMLElement, beans: Beans, colsSpanning?: Column[]) {
        super();
        this.columnOrGroup = columnOrGroup;
        this.eCell = eCell;
        this.colsSpanning = colsSpanning;
        this.beans = beans;
        this.printLayout = beans.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
    }

    public setColsSpanning(colsSpanning: Column[]): void {
        this.colsSpanning = colsSpanning;
        this.onLeftChanged();
    }

    public getColumnOrGroup(): ColumnGroupChild {
        if (this.beans.gridOptionsWrapper.isEnableRtl() && this.colsSpanning) {
            return _.last(this.colsSpanning);
        } else {
            return this.columnOrGroup;
        }
    }

    public init(): void {
        this.addDestroyableEventListener(this.columnOrGroup, Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.setLeftFirstTime();
    }

    private setLeftFirstTime(): void {
        const suppressMoveAnimation = this.beans.gridOptionsWrapper.isSuppressColumnMoveAnimation();
        const oldLeftExists = _.exists(this.columnOrGroup.getOldLeft());
        const animateColumnMove = this.beans.columnAnimationService.isActive() && oldLeftExists && !suppressMoveAnimation;
        if (animateColumnMove) {
            this.animateInLeft();
        } else {
            this.onLeftChanged();
        }
    }

    private animateInLeft(): void {
        const left = this.getColumnOrGroup().getLeft();
        const oldLeft = this.getColumnOrGroup().getOldLeft();
        this.setLeft(oldLeft);

        // we must keep track of the left we want to set to, as this would otherwise lead to a race
        // condition, if the user changed the left value many times in one VM turn, then we want to make
        // make sure the actualLeft we set in the timeout below (in the next VM turn) is the correct left
        // position. eg if user changes column position twice, then setLeft() below executes twice in next
        // VM turn, but only one (the correct one) should get applied.
        this.actualLeft = left;

        this.beans.columnAnimationService.executeNextVMTurn(() => {
            // test this left value is the latest one to be applied, and if not, do nothing
            if (this.actualLeft === left) {
                this.setLeft(left);
            }
        });
    }

    private onLeftChanged(): void {
        const colOrGroup = this.getColumnOrGroup();
        const left = colOrGroup.getLeft();
        this.actualLeft = this.modifyLeftForPrintLayout(colOrGroup, left);
        this.setLeft(this.actualLeft);
    }

    private modifyLeftForPrintLayout(colOrGroup: ColumnGroupChild, leftPosition: number): number {
        if (!this.printLayout) { return leftPosition; }

        if (colOrGroup.getPinned() === Column.PINNED_LEFT) {
            return leftPosition;
        } else if (colOrGroup.getPinned() === Column.PINNED_RIGHT) {
            const leftWidth = this.beans.columnController.getPinnedLeftContainerWidth();
            const bodyWidth = this.beans.columnController.getBodyContainerWidth();
            return leftWidth + bodyWidth + leftPosition;
        } else {
            // is in body
            const leftWidth = this.beans.columnController.getPinnedLeftContainerWidth();
            return leftWidth + leftPosition;
        }
    }

    private setLeft(value: number): void {
        // if the value is null, then that means the column is no longer
        // displayed. there is logic in the rendering to fade these columns
        // out, so we don't try and change their left positions.
        if (_.exists(value)) {
            this.eCell.style.left = `${value}px`;
        }
    }

}
