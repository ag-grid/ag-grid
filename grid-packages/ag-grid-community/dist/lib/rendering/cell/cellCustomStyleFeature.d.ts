import { BeanStub } from "../../context/beanStub";
import { CellCtrl, ICellComp } from "./cellCtrl";
import { Beans } from "../beans";
export declare class CellCustomStyleFeature extends BeanStub {
    private readonly cellCtrl;
    private readonly column;
    private readonly rowNode;
    private readonly beans;
    private staticClasses;
    private cellComp;
    constructor(ctrl: CellCtrl, beans: Beans);
    setComp(comp: ICellComp): void;
    applyCellClassRules(): void;
    applyUserStyles(): void;
    applyClassesFromColDef(): void;
    destroy(): void;
}
