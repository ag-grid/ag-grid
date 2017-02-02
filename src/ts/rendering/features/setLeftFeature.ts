
import {ColumnGroupChild} from "../../entities/columnGroupChild";
import {Utils as _} from "../../utils";
import {Column} from "../../entities/column";
import {BeanStub} from "../../context/beanStub";
import {Autowired, PostConstruct} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {VMTurnService} from "../../misc/vmTurnService";

export class SetLeftFeature extends BeanStub {

    private columnOrGroup: ColumnGroupChild;
    private eCell: HTMLElement;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('vmTurnService') private vmTurnService: VMTurnService;

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
        let animateColumnMove = this.vmTurnService.isActive() && oldLeftExists && !suppressMoveAnimation;
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
        this.vmTurnService.executeNextVMTurn( () => {
            this.setLeft(left);
        });
    }

    private onLeftChanged(): void {
        this.setLeft(this.columnOrGroup.getLeft());
    }

    private setLeft(value: number): void {
        if (_.exists(value)) {
            this.eCell.style.left = value + 'px';
        } else {
            this.eCell.style.left = '';
        }
    }

}
