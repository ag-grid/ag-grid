import type { AgBaseBean } from '../agStack/interfaces/iBean';
import type { BeanCollection } from '../context/context';
import type { ICellComp } from '../rendering/cell/cellCtrl';

export interface ICellStyleFeature extends AgBaseBean<BeanCollection> {
    setComp(comp: ICellComp): void;
    applyCellStyles?(): void;
    applyCellClassRules?(): void;
    applyUserStyles?(): void;
    applyClassesFromColDef?(): void;
}
