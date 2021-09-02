import { BeanStub } from "../../context/beanStub";
import { ColumnGroupChild } from "../../entities/columnGroupChild";
import { HeaderRowCtrl } from "../headerRow/headerRowCtrl";

let instanceIdSequence = 0;

export class HeaderCtrl extends BeanStub {

    private instanceId: string;

    private columnGroupChild: ColumnGroupChild;

    private parentRowCtrl: HeaderRowCtrl;

    constructor(columnGroupChild: ColumnGroupChild, parentRowCtrl: HeaderRowCtrl) {
        super();

        this.columnGroupChild = columnGroupChild;
        this.parentRowCtrl = parentRowCtrl;

        // unique id to this instance, including the column ID to help with debugging in React as it's used in 'key'
        this.instanceId = columnGroupChild.getUniqueId() + '-' + instanceIdSequence++;
    }

    public getRowIndex(): number {
        return this.parentRowCtrl.getDepth();
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

    public getColumnGroupOrChild(): ColumnGroupChild {
        return this.columnGroupChild;
    }
}
