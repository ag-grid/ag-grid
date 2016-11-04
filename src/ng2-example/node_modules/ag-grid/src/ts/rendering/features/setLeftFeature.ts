
import {ColumnGroupChild} from "../../entities/columnGroupChild";
import {Utils as _} from "../../utils";
import {Column} from "../../entities/column";

export class SetLeftFeature {

    private columnOrGroup: ColumnGroupChild;
    private eCell: HTMLElement;

    private destroyFunctions: (()=>void)[] = [];
    
    constructor(columnOrGroup: ColumnGroupChild, eCell: HTMLElement) {
        this.columnOrGroup = columnOrGroup;
        this.eCell = eCell;
        this.init();
    }
    
    private init(): void {
        var listener = this.onLeftChanged.bind(this);

        this.columnOrGroup.addEventListener(Column.EVENT_LEFT_CHANGED, listener);
        this.destroyFunctions.push( () => {
            this.columnOrGroup.removeEventListener(Column.EVENT_LEFT_CHANGED, listener);
        });

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

    public destroy(): void {
        this.destroyFunctions.forEach( (func)=> {
            func();
        });
    }

}
