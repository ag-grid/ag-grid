
import {ColumnGroupChild} from "../../entities/columnGroupChild";
import {Utils as _} from "../../utils";
import {Column} from "../../entities/column";
import {BeanStub} from "../../context/beanStub";
import {Autowired, PostConstruct} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {ColumnAnimationService} from "../columnAnimationService";
import {EventService} from "../../eventService";
import {Events} from "../../events";

export class SetLeftFeature extends BeanStub {

    private columnOrGroup: ColumnGroupChild;
    private eCell: HTMLElement;

    private actualLeft: number;

    // if we are spanning columns, this tells what columns,
    // otherwise this is empty
    private colsSpanning: Column[];

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnAnimationService') private columnAnimationService: ColumnAnimationService;

    constructor(columnOrGroup: ColumnGroupChild, eCell: HTMLElement, colsSpanning?: Column[]) {
        super();
        this.columnOrGroup = columnOrGroup;
        this.eCell = eCell;
        this.colsSpanning = colsSpanning;
    }

    public setColsSpanning(colsSpanning: Column[]): void {
        this.colsSpanning = colsSpanning;
        this.onLeftChanged();
    }

    public getColumnOrGroup(): ColumnGroupChild {
        if (this.gridOptionsWrapper.isEnableRtl() && this.colsSpanning) {
            return this.colsSpanning[this.colsSpanning.length-1];
        } else {
            return this.columnOrGroup;
        }
    }

    @PostConstruct
    private init(): void {
        this.addDestroyableEventListener(this.columnOrGroup, Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.setLeftFirstTime();
    }

    private setLeftFirstTime(): void {
        let suppressMoveAnimation = this.gridOptionsWrapper.isSuppressColumnMoveAnimation();
        let oldLeftExists = _.exists(this.columnOrGroup.getOldLeft());
        let animateColumnMove = this.columnAnimationService.isActive() && oldLeftExists && !suppressMoveAnimation;
        if (animateColumnMove) {
            this.animateInLeft();
        } else {
            this.onLeftChanged();
        }
    }

    private animateInLeft(): void {
        let left = this.getColumnOrGroup().getLeft();
        let oldLeft = this.getColumnOrGroup().getOldLeft();
        this.setLeft(oldLeft);

        // we must keep track of the left we want to set to, as this would otherwise lead to a race
        // condition, if the user changed the left value many times in one VM turn, then we want to make
        // make sure the actualLeft we set in the timeout below (in the next VM turn) is the correct left
        // position. eg if user changes column position twice, then setLeft() below executes twice in next
        // VM turn, but only one (the correct one) should get applied.
        this.actualLeft = left;

        this.columnAnimationService.executeNextVMTurn( () => {
            // test this left value is the latest one to be applied, and if not, do nothing
            if (this.actualLeft===left) {
                this.setLeft(left);
            }
        });
    }

    private onLeftChanged(): void {
        this.actualLeft = this.getColumnOrGroup().getLeft();
        this.setLeft(this.actualLeft);
    }

    private setLeft(value: number): void {
        // if the value is null, then that means the column is no longer
        // displayed. there is logic in the rendering to fade these columns
        // out, so we don't try and change their left positions.
        if (_.exists(value)) {
            this.eCell.style.left = value + 'px';
        }
    }

}
