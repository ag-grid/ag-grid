
import {ColumnGroupChild} from "../../entities/columnGroupChild";
import {Utils as _} from "../../utils";
import {Column} from "../../entities/column";
import {BeanStub} from "../../context/beanStub";
import {Autowired, PostConstruct} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {ColumnAnimationService} from "../columnAnimationService";

export class SetLeftFeature extends BeanStub {

    private columnOrGroup: ColumnGroupChild;
    private eCell: HTMLElement;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnAnimationService') private columnAnimationService: ColumnAnimationService;

    constructor(columnOrGroup: ColumnGroupChild, eCell: HTMLElement) {
        super();
        this.columnOrGroup = columnOrGroup;
        this.eCell = eCell;
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
        let left = this.columnOrGroup.getLeft();
        let oldLeft = this.columnOrGroup.getOldLeft();
        this.setLeft(oldLeft);
        this.columnAnimationService.executeNextVMTurn( () => {
            this.setLeft(left);
        });
    }

    private onLeftChanged(): void {
        this.setLeft(this.columnOrGroup.getLeft());
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
