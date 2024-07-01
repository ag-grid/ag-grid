import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { CellCtrl, ICellComp } from './cellCtrl';
export declare class CellCustomStyleFeature extends BeanStub {
    private readonly cellCtrl;
    private readonly column;
    private readonly rowNode;
    private readonly beans;
    private staticClasses;
    private cellComp;
    private cellClassRules?;
    constructor(ctrl: CellCtrl, beans: BeanCollection);
    setComp(comp: ICellComp): void;
    applyCellClassRules(): void;
    applyUserStyles(): void;
    applyClassesFromColDef(): void;
    destroy(): void;
}
