
import {ColumnGroupChild} from "../../entities/columnGroupChild";
import {Utils as _} from "../../utils";
import {Column} from "../../entities/column";
import {BeanStub} from "../../context/beanStub";

export class SetLeftFeature extends BeanStub {

    private columnOrGroup: ColumnGroupChild;
    private eCell: HTMLElement;

    constructor(columnOrGroup: ColumnGroupChild, eCell: HTMLElement) {
        super();
        this.columnOrGroup = columnOrGroup;
        this.eCell = eCell;
        this.init();
    }
    
    private init(): void {
        this.addDestroyableEventListener(this.columnOrGroup, Column.EVENT_LEFT_CHANGED, this.onLeftChanged.bind(this));
        this.onLeftChanged();
    }

    private onLeftChanged(): void {
        var newLeft = this.columnOrGroup.getLeft();
        if (_.exists(newLeft)) {
            this.eCell.style.left = this.columnOrGroup.getLeft() + 'px';
        } else {
            this.eCell.style.left = '';
        }
    }

}
