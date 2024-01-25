// Type definitions for @ag-grid-community/core v31.0.3
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
    private cellClassRules?;
    constructor(ctrl: CellCtrl, beans: Beans);
    setComp(comp: ICellComp): void;
    applyCellClassRules(): void;
    applyUserStyles(): void;
    applyClassesFromColDef(): void;
    destroy(): void;
}
