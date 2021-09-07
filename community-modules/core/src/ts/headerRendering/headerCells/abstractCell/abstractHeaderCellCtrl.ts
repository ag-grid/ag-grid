import { BeanStub } from "../../../context/beanStub";
import { ColumnGroupChild } from "../../../entities/columnGroupChild";
import { IHeaderCellComp } from "../columnCell/headerCellCtrl";
import { HeaderRowCtrl } from "../../headerRow/headerRowCtrl";

let instanceIdSequence = 0;

export interface IAbstractHeaderCellComp {
    focus(): void;
}

export class AbstractHeaderCellCtrl extends BeanStub {

    private instanceId: string;

    private columnGroupChild: ColumnGroupChild;

    private parentRowCtrl: HeaderRowCtrl;

    private comp: IHeaderCellComp;

    constructor(columnGroupChild: ColumnGroupChild, parentRowCtrl: HeaderRowCtrl) {
        super();

        this.columnGroupChild = columnGroupChild;
        this.parentRowCtrl = parentRowCtrl;

        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = columnGroupChild.getUniqueId() + '-' + instanceIdSequence++;
    }

    public setComp(comp: IHeaderCellComp): void {
        this.comp = comp;
    }

    public focus(): boolean {
        if (!this.comp) { return false; }

        this.comp.focus();
        return true;
    }

    public getRowIndex(): number {
        return this.parentRowCtrl.getRowIndex();
    }

    public getParentRowCtrl(): HeaderRowCtrl {
        return this.parentRowCtrl;
    }

    public getPinned(): string | null {
        return this.parentRowCtrl.getPinned();
    }

    public getInstanceId(): string {
        return this.instanceId;
    }

    public getColumnGroupChild(): ColumnGroupChild {
        return this.columnGroupChild;
    }
}
