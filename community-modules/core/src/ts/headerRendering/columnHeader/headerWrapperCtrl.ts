import { BeanStub } from "../../context/beanStub";
import { ColumnGroupChild } from "../../entities/columnGroupChild";
import { HeaderRowCtrl } from "../headerRow/headerRowCtrl";

let instanceIdSequence = 0;

export interface IHeaderWrapperComp {
    focus(): void;
}

export class HeaderWrapperCtrl extends BeanStub {

    private instanceId: string;

    private columnGroupChild: ColumnGroupChild;

    private parentRowCtrl: HeaderRowCtrl;

    private comp: IHeaderWrapperComp;

    constructor(columnGroupChild: ColumnGroupChild, parentRowCtrl: HeaderRowCtrl) {
        super();

        this.columnGroupChild = columnGroupChild;
        this.parentRowCtrl = parentRowCtrl;

        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = columnGroupChild.getUniqueId() + '-' + instanceIdSequence++;
    }

    public setComp(comp: IHeaderWrapperComp): void {
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
